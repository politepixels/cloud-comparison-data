const Logger = require(`${__basedir}/classes/Logger`);

const log = Logger.of(`system.process`);

class Process {
  constructor() {
    this.registerHooks();
    this.isExiting = false;
  }

  registerHooks() {
    process.on('uncaughtException', err => {
      log.report(
        `Uncaught Exception: ${err.message}`,
        true,
        Logger.LOG_LEVELS.ERROR
      )(err);
      return this.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      log.report(
        `Unhandled rejection`,
        true,
        Logger.LOG_LEVELS.ERROR
      )({
        reason,
        promise
      });
      // this.exit(1);
    });

    process.on('SIGTERM', signal => {
      log.report(
        `Process ${process.pid} received a SIGTERM signal`,
        true
      )({
        signal
      });

      return this.exit(0);
    });

    process.on('SIGQUIT', signal => {
      log.report(
        `Process ${process.pid} received a SIGQUIT signal`,
        true
      )({
        signal
      });

      return this.exit(0);
    });

    process.on('SIGINT', signal => {
      log.report(
        `Process ${process.pid} has been interrupted`,
        true
      )({
        signal
      });

      return this.exit(0);
    });
  }

  exit(code = 0) {
    if (this.isExiting)
      return;

    this.isExiting = true;

    const timeout = (timeout) => new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('Process Too Long To Safely Close');
      }, timeout);
    });

    setTimeout(log.do(
      `Process took too long to exit`,
      () => process.exit(code)
    ), 12000).unref();

    return Promise.resolve()
      // todo add any teardown we need to do
      .then(log.report(
        `Bye`
      ))
      .then(() => new Promise((accept) => setTimeout(accept, 1000)))
      .then(() => process.exit(code))
      .catch(log.do(
        `Error gracefully closing`,
        () => setTimeout(() => process.exit(code), 500),
        true
      ));
  }
}

module.exports = new Process();