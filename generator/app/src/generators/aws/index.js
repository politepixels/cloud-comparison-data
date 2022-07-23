const Logger = require(`${__basedir}/classes/Logger`);
const KPromise = require(`${__basedir}/classes/KPromise`);
const logger = Logger.of(`aws`);
const fs = require('fs');

module.exports = KPromise.start(logger)
  .peekLog(
    `Creating Output Folder`,
    () => fs.mkdirSync(`${global.__datadir}/aws`, {recursive: true})
  )
  .doLog(
    `Processing...`,
    () => Promise.all([
      require(`${__basedir}/generators/aws/metadata`)(),
      // require(`${__basedir}/generators/aws/compliance`)(),
      // require(`${__basedir}/generators/aws/region`)(),
      // require(`${__basedir}/generators/aws/server`)(),
    ])
  )
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();