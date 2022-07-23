const KPromise = require(`${__basedir}/classes/KPromise`);
const Logger = require(`${__basedir}/classes/Logger`);

const Metadata = require(`${__basedir}/types/Metadata`);

const yaml = require('js-yaml');
const fs   = require('fs');

const log = Logger.of(`aws.metadata`);

module.exports = () => KPromise.start(log)
  .recordRequireLog(
    `Retrieving Data From Manually Managed Cache`,
    `metadata_file`,
    () => fs.readFileSync(`${global.__providerdir}/aws/metadata.yaml`, 'utf8')
  )
  .recordRequireLog(
    `Parsing Yaml`,
    `metadata_raw`,
    ({metadata_file}) => yaml.load(metadata_file)
  )
  .recordRequireLog(
    `Normalising`,
    `metadata`,
    ({metadata_raw}) => Metadata.of(`aws`)
      .setName(metadata_raw.name)
      .setUrl(metadata_raw.url)
      .setReferral(metadata_raw.referral)
      .generateId()
  )
  .peekLog(
    `Write to file`,
    ({metadata}) => fs.writeFileSync(`${global.__datadir}/aws/metadata.yaml`, JSON.stringify(metadata, null, 2), 'utf8')
  )
  .doLog(`Finished`, ({metadata}) => Promise.resolve(metadata))
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();