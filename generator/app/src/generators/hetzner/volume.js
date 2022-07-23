const KPromise = require(`${__basedir}/classes/KPromise`);
const Logger = require(`${__basedir}/classes/Logger`);

const Volume = require(`${__basedir}/types/Volume`);

const fs = require('fs');
const axios = require("axios");
const yaml = require("js-yaml");

const log = Logger.of(`hetzner.volume`);

module.exports = ({pricing}) => KPromise.start(log)
  .recordRequireLog(
    `Retrieving Data From Manually Managed Cache`,
    `volumes_file`,
    () => fs.readFileSync(`${global.__providerdir}/hetzner/volume.yaml`, 'utf8')
  )
  .recordRequireLog(
    `Parsing Yaml`,
    `volumes_raw`,
    ({volumes_file}) => yaml.load(volumes_file)
  )
  .recordRequireLog(
    `Normalising`,
    `volumes`,
    ({volumes_raw}) => volumes_raw.flatMap((volume) =>
      volume.regions.map((volume_region) =>
        Volume.of(`hetzner`)
          .setName(volume.name)
          .setMinSizeInGiB(volume.minSizeInGiB)
          .setMaxSizeInGiB(volume.maxSizeInGiB)
          .setRegion(volume_region)
          .setPricePerHourPerGiB(pricing.volume.price_per_gb_month.gross)
          .generateId()
      )
    )
  )
  .peekLog(
    `Write to file`,
    ({volumes}) => fs.writeFileSync(`${global.__datadir}/hetzner/volumes.yaml`, JSON.stringify(volumes, null, 2), 'utf8')
  )
  .doLog(`Finished`, ({servers}) => Promise.resolve(servers))
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();