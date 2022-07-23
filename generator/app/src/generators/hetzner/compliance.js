const KPromise = require(`${__basedir}/classes/KPromise`);
const Logger = require(`${__basedir}/classes/Logger`);

const Compliance = require(`${__basedir}/types/Compliance`);

const yaml = require('js-yaml');
const fs   = require('fs');

const log = Logger.of(`hetzner.compliance`);

module.exports = () => KPromise.start(log)
  .recordRequireLog(
    `Retrieving Data From Manually Managed Cache`,
    `compliance_file`,
    () => fs.readFileSync(`${global.__providerdir}/hetzner/compliance.yaml`, 'utf8')
  )
  .recordRequireLog(
    `Parsing Yaml`,
    `compliance_raw`,
    ({compliance_file}) => yaml.load(compliance_file)
  )
  .recordRequireLog(
    `Normalising`,
    `compliance`,
    ({compliance_raw}) => compliance_raw.flatMap((compliance) =>
      compliance.regions.map((compliance_region) =>
        Compliance.of(`hetzner`)
          .setName(compliance.name)
          .setUrl(compliance.url)
          .setRegion(compliance_region)
          .generateId()
      )
    )
  )
  .peekLog(
    `Write to file`,
    ({compliance}) => fs.writeFileSync(`${global.__datadir}/hetzner/compliances.yaml`, JSON.stringify(compliance, null, 2), 'utf8')
  )
  .doLog(`Finished`, ({compliance}) => Promise.resolve(compliance))
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();