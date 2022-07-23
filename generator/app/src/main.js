global.__basedir = __dirname || process.env.BASE_DIR;
global.__providerdir = !!process.env.PROVIDERS_PATH ? process.env.PROVIDERS_PATH : `${global.__basedir}/../../../providers`;
global.__datadir = !!process.env.DATA_PATH ? process.env.DATA_PATH : `${global.__basedir}/../../../data`;
global.__mainThread = true;
global.__threadName = `main [${process.pid}]`;

const Logger = require(`${__basedir}/classes/Logger`);
const KPromise = require(`${__basedir}/classes/KPromise`);
const logger = Logger.of(`main`);

KPromise.start(logger)
  .reportLog(
    `Starting logger with log level: ${logger._getLogLevelsName(logger._configured_log_level)} - ${logger._configured_log_level}`
  )
  .peekIfLog(
    `Starting server with debugger attachable - NOT FOR PRODUCTION`,
    () => [`true`, `brk`].includes(process.env.APP_DEBUG?.toLowerCase())
  )
  .reportIfLog(
    `Starting server with ${process.env.NODE_MEMORY} MiB available memory`,
    () => !!process.env.NODE_MEMORY
  )
  .recordRequireLog(
    `Initialising Process Manager`,
    `processManager`,
    () => require(`${__basedir}/classes/Process`)
  )
  .peek(() => logger.report(
    `Starting application with environments`,
    true,
    Logger.LOG_LEVELS.TRACE
  )(JSON.stringify(process.env)))
  .peekLog(
    `Processing Generators...`,
    () => Promise.all([
      ...!!process.env.PARSE_HETZNER && process.env.PARSE_HETZNER === 'true' ? [require(`${__basedir}/generators/hetzner`)] : [],
      ...!!process.env.PARSE_AWS && process.env.PARSE_AWS === 'true' ? [require(`${__basedir}/generators/aws`)] : [],
    ])
  )
  .doLog(
    `All Done!`,
    ({processManager}) => !!processManager ? processManager.exit(0) : process.exit(0)
  )
  .catchBubbleReportLog(`Fatal Error`, true)
  .catchDo((_, {processManager}) => !!processManager ? processManager.exit(1) : process.exit(1))
  .cleanup();