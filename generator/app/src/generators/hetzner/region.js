const KPromise = require(`${__basedir}/classes/KPromise`);
const Logger = require(`${__basedir}/classes/Logger`);

const Region = require(`${__basedir}/types/Region`);

const fs = require('fs');
const axios = require("axios");

const log = Logger.of(`hetzner.region`);

module.exports = () => KPromise.start(log)
  .recordRequireLog(
    `Retrieving Data From API`,
    `regions_response`,
    () => axios.get("https://api.hetzner.cloud/v1/locations", {
      headers: {
        'Authorization': `Bearer ${process.env.HETZNER_API_KEY}`
      }
    })
  )
  .recordRequireLog(
    `Parsing Response`,
    `regions_raw`,
    ({regions_response}) => regions_response?.data?.locations || []
  )
  .recordRequireLog(
    `Normalising`,
    `regions`,
    ({regions_raw}) => regions_raw.map((region) =>
      Region.of(`hetzner`)
        .setName(region.name)
        .setDescription(region.description)
        .setLatitude(region.latitude)
        .setLongitude(region.longitude)
        .setZoneName(region.network_zone)
        .setCountryCode(region.country)
        .setCity(region.city)
        .generateId()
    )
  )
  .peekLog(
    `Write to file`,
    ({regions}) => fs.writeFileSync(`${global.__datadir}/hetzner/regions.yaml`, JSON.stringify(regions, null, 2), 'utf8')
  )
  .doLog(`Finished`, ({regions}) => Promise.resolve(regions))
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();