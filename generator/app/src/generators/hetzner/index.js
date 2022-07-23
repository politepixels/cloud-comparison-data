const Logger = require(`${__basedir}/classes/Logger`);
const KPromise = require(`${__basedir}/classes/KPromise`);
const logger = Logger.of(`hetzner`);
const fs = require('fs');

module.exports = KPromise.start(logger)
  .peekLog(
    `Creating Output Folder`,
    () => fs.mkdirSync(`${global.__datadir}/hetzner`, {recursive: true})
  )
  .recordRequireLog(
    `Processing Pricing`,
    `pricing`,
    () => require(`${__basedir}/generators/hetzner/pricing`)(),
  )
  .doLog(
    `Processing Async...`,
    ({pricing}) => Promise.all([
      require(`${__basedir}/generators/hetzner/metadata`)(),
      require(`${__basedir}/generators/hetzner/compliance`)(),
      require(`${__basedir}/generators/hetzner/region`)(),
      require(`${__basedir}/generators/hetzner/server`)(),
      require(`${__basedir}/generators/hetzner/volume`)({pricing}),
    ])
  )
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();