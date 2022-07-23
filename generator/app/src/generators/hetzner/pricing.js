const KPromise = require(`${__basedir}/classes/KPromise`);
const Logger = require(`${__basedir}/classes/Logger`);

const axios = require("axios");

const log = Logger.of(`hetzner.pricing`);

module.exports = () => KPromise.start(log)
  .recordRequireLog(
    `Retrieving Data From API`,
    `pricing_response`,
    () => axios.get("https://api.hetzner.cloud/v1/pricing", {
      headers: {
        'Authorization': `Bearer ${process.env.HETZNER_API_KEY}`
      }
    })
  )
  .recordRequireLog(
    `Parsing Response`,
    `pricing_raw`,
    ({pricing_response}) => pricing_response?.data?.pricing || []
  )
  .doLog(`Finished`, ({pricing_raw}) => Promise.resolve(pricing_raw))
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();