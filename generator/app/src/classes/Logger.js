const util = require(`util`);
const moment = require(`moment`);
const Slack = require(`${__basedir}/classes/Slack`);
const Errors = require(`${__basedir}/classes/Errors`);
const chalk = require('chalk');
const hasAnsi = require('has-ansi');

util.inspect.defaultOptions.depth = null;

class FilterError extends Error {
  constructor(message) {
    super(message);
    this.name = "FilterError";
  }
}

class Logger {
  static LOG_LEVELS = {
    TRACE: 0,
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5
  };

  static LOG_TYPES = {
    TEXT: 0,
    JSON: 1
  };

  static GRACE_MS = 10;

  static LOG_COLOURS = (process.env.LOG_COLOURS === true || process.env.LOG_COLOURS?.toLowerCase() === 'true');
  static ENVIRONMENT = process.env.ENVIRONMENT_CONTEXT || process.env.ENVIRONMENT;
  static LAST_MESSAGES_COUNT = 5;

  static newFilterError(message) {
    return new FilterError(message);
  };

  static of(context = '', reference = '', userid = '', ipAddr = '', defaultLogLevel = Logger.LOG_LEVELS.INFO, defaultQueryLogLevel = Logger.LOG_LEVELS.TRACE) {
    return new Logger(context, reference, userid, ipAddr, defaultLogLevel, defaultQueryLogLevel);
  }

  constructor(context, reference, userid, ipAddr, defaultLogLevel = Logger.LOG_LEVELS.INFO, defaultQueryLogLevel = Logger.LOG_LEVELS.TRACE) {
    this._context = context;
    this._reference = reference;
    this._userid = userid;
    this._ipAddr = ipAddr;
    this._defaultLogLevel = defaultLogLevel;
    this._defaultQueryLogLevel = defaultQueryLogLevel;
    this._lastMessages = [];

    this._configured_log_level = Logger.LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase() || `INFO`];
    this._configured_log_type = Logger.LOG_TYPES[process.env.LOG_TYPE?.toUpperCase() || `TEXT`];

    this._chalk = new chalk.Instance({
      level: (!Logger.LOG_COLOURS || this._configured_log_type === Logger.LOG_TYPES.JSON) ? 0 : 3
    });
  }

  newFilterError(message = "Filtered Out Result") {
    return Logger.newFilterError(message);
  };

  _getLogLevelsName(logLevel) {
    return Object.keys(Logger.LOG_LEVELS).find((logLevelName) => Logger.LOG_LEVELS[logLevelName] === logLevel) || `UNKNOWN`;
  }

  _prepareLogLine(logLine, logLevel = undefined) {
    const dateTime = process.env.DATE_UNIX?.toLowerCase() === `true` ? Date.now() : moment().toISOString();

    const logObject = {
      "dateTime": this._chalk.blue(dateTime),
      ...!!Logger.ENVIRONMENT && {"environment": this._chalk.cyan(Logger.ENVIRONMENT)},
      ...!!global.__threadName && { "thread": this._chalk.white(global.__threadName) },
      ...logLevel !== undefined && logLevel === Logger.LOG_LEVELS.TRACE && {"logLevel": this._chalk.blackBright(this._getLogLevelsName(logLevel))},
      ...logLevel !== undefined && logLevel === Logger.LOG_LEVELS.DEBUG && {"logLevel": this._chalk.green(this._getLogLevelsName(logLevel))},
      ...logLevel !== undefined && logLevel === Logger.LOG_LEVELS.INFO && {"logLevel": this._chalk.yellow(this._getLogLevelsName(logLevel))},
      ...logLevel !== undefined && logLevel === Logger.LOG_LEVELS.WARN && {"logLevel": this._chalk.yellowBright(this._getLogLevelsName(logLevel))},
      ...logLevel !== undefined && logLevel === Logger.LOG_LEVELS.ERROR && {"logLevel": this._chalk.red(this._getLogLevelsName(logLevel))},
      ...logLevel !== undefined && logLevel === Logger.LOG_LEVELS.FATAL && {"logLevel": this._chalk.redBright(this._getLogLevelsName(logLevel))},
      ...process.env.HOSTNAME?.length && {"hostName": this._chalk.blueBright(process.env.HOSTNAME)},
      ...!!this._context?.length > 0 && {"context": this._chalk.magenta(this._context)},
      ...!!this._reference?.length > 0 && {"reference": this._chalk.greenBright(this._reference)},
      ...!!this._userid?.length > 0 && {"userid": this._chalk.blueBright(this._userid)},
      ...!!this._ipAddr?.length > 0 && {"ipAddr": this._chalk.magentaBright(this._ipAddr)},
      "message": hasAnsi(logLine) ? logLine : this._chalk.whiteBright(logLine)
    };

    return this._configured_log_type === Logger.LOG_TYPES.JSON ? JSON.stringify(logObject) : Object.values(logObject).join(`: `);
  }

  extend(newSubContext = ``, newLogLevel = null) {
    return Logger.of(`${this._context}${!!newSubContext && newSubContext.length > 0 ? `.` : ``}${newSubContext}`, this._reference, this._userid, this._ipAddr, newLogLevel === null ? this._defaultLogLevel : newLogLevel, newLogLevel === null ? this._defaultQueryLogLevel : newLogLevel);
  }

  _error(...args) {
    this._lastMessages.unshift(args.join(' - '));
    this._lastMessages.splice(Logger.LAST_MESSAGES_COUNT);
    console.error(...args);
  }

  _log(...args) {
    this._lastMessages.unshift(args.join(' - '));
    this._lastMessages.splice(Logger.LAST_MESSAGES_COUNT);
    console.log(...args);
  }

  do(log, method, logParamData = false, log_level = this._defaultLogLevel) {
    return (...params) => {
      // known error types we want to ignore as errors because they have known error handling flows
      // but still listed as warn because ideally they should not even be reported as an error here anyway, so it means upstream the 'error' needs to be handled & silenced
      if (!!params && (params[0] instanceof Errors.StatusSafeError || params[0] instanceof FilterError) && log_level === Logger.LOG_LEVELS.ERROR) {
        log_level = Logger.LOG_LEVELS.WARN;
      }

      if (this._configured_log_level <= log_level) {
        if (!!log && log.length > 0) {
          let logLine = this._prepareLogLine(log, log_level);

          if (log_level === Logger.LOG_LEVELS.ERROR) {
            this._error(logLine);
            if (!logParamData) {
              Slack.postMessage(Slack.CHANNELS.ERRORS, [`*System Error (${this._context}):*`].concat(this._lastMessages.reverse()).join('\n'));
            }
          } else {
            this._log(logLine);
          }
        }

        if (logParamData) {
          let paramData = util.inspect(params[0], {showHidden: false, depth: null, colors: true}).toString();

          if (paramData.length > 3000) {
            paramData = util.inspect(params[0], {showHidden: false, depth: 2, colors: true}).toString().substr(0, 3000);
            this._log(this._prepareLogLine(`Truncated parameter data: ${paramData}`, log_level));
          } else {
            this._log(this._prepareLogLine(`Parameter data: ${paramData}`, log_level));
          }

          if (log_level === Logger.LOG_LEVELS.ERROR) {
            Slack.postMessage(Slack.CHANNELS.ERRORS, [`*System Error (${this._context}):*`].concat(this._lastMessages.reverse()).join('\n'));
          }
        }
      }

      const t0 = performance.now();

      return Promise.resolve()
        .then(() => method(...params))
        .finally(() => {
          let ll = Logger.LOG_LEVELS.TRACE;

          if (!!log && log.length > 0)
            ll = log_level;

          if (this._configured_log_level <= ll) {
            const t1 = performance.now();
            const diff = Math.round((t1 - t0) * 100) / 100;
            diff > Logger.GRACE_MS && this._log(this._prepareLogLine(this._chalk.blackBright(`... took: ${diff} milliseconds.`), log_level));
          }
        });
    }
  }

  doIf(log, query, method, logParamData = false, log_level = this._defaultLogLevel) {
    return (...params) => Promise.resolve()
      .then(() => query(...params))
      .then((output) => output === true ?
        this.do(log, method, logParamData, log_level)(...params) :
        Promise.resolve(params[0])
      );
  }

  _isNormalObject(input) {
    return !!input && typeof input === `object` && !Array.isArray(input) && Object.getPrototypeOf(input) === Object.prototype;
  }

  record(log, name, method, logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then((output) => Object.assign(this._isNormalObject(input[0]) ? input[0] : {}, {
            [`${name}`]: output,
            ...(!this._isNormalObject(input[0]) && {old: input[0]})
          })),
      logParamData, log_level);
  }

  recordIf(log, name, query, method, onReject = undefined, logParamData = false, log_level = this._defaultLogLevel) {
    return this.doIf(log, query, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then((output) => Object.assign(this._isNormalObject(input[0]) ? input[0] : {}, {
            [`${name}`]: output,
            ...(!this._isNormalObject(input[0]) && {old: input[0]})
          })),
      logParamData, log_level);
  }

  recordRequire(log, name, method, onReject = undefined, logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then((output) => new Promise((resolve, reject) =>
            (output === undefined || output === null) ? (!!onReject ? Promise.resolve(onReject(input[0])).then(reject).catch(reject) : reject(new Error(`${log}: Record not found`))) : resolve(output)
          ))
          .then((output) => Object.assign(this._isNormalObject(input[0]) ? input[0] : {}, {
            [`${name}`]: output,
            ...(!this._isNormalObject(input[0]) && {old: input[0]})
          })),
      logParamData, log_level);
  }

  recordRequireIf(log, name, query, method, onReject = undefined, logParamData = false, log_level = this._defaultLogLevel) {
    return this.doIf(log, query, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then((output) => new Promise((resolve, reject) =>
            (output === undefined || output === null) ? (!!onReject ? Promise.resolve(onReject(input[0])).then(reject).catch(reject) : reject(new Error(`${log}: Record not found`))) : resolve(output)
          ))
          .then((output) => Object.assign(this._isNormalObject(input[0]) ? input[0] : {}, {
            [`${name}`]: output,
            ...(!this._isNormalObject(input[0]) && {old: input[0]})
          })),
      logParamData, log_level);
  }

  filter(log, method, onReject = () => Logger.newFilterError(), logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then((output) => output === true ? Promise.resolve() : Promise.reject(onReject(input[0])))
          .then(() => input[0]),
      logParamData, log_level);
  }

  poll(interval, maxDuration, method) {
    return (...input) =>
      new Promise((resolve, reject) => {
        let iterations = 1;
        let timeouts = [];
        const checkMethod = () => {
          Promise.resolve()
            .then(() => method(...input))
            .then((resp) => {
              if (!resp && maxDuration >= (++iterations * interval)) {
                timeouts.push(setTimeout(() => checkMethod(), interval * 1000));
              } else {
                timeouts.forEach((timeout) => clearTimeout(timeout));
                !!resp ? resolve(resp) : reject(resp);
              }
            })
            .catch(reject);
        };

        checkMethod();
      });
  }

  filterIfPoll(log, query, method, interval = 30, maxDuration = 600, onReject = () => Logger.newFilterError(), logParamData = false, log_level = this._defaultLogLevel) {
    return this.doIf(log, query, (...input) =>
        Promise.resolve(...input)
          .then(this.poll(interval, maxDuration, method))
          .then((output) => output === true ? Promise.resolve() : Promise.reject(onReject(input[0])))
          .then(() => input[0]),
      logParamData, log_level);
  }

  filterPoll(log, method, interval = 30, maxDuration = 600, onReject = () => Logger.newFilterError(), logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) =>
        Promise.resolve(...input)
          .then(this.poll(interval, maxDuration, method))
          .then((output) => output === true ? Promise.resolve() : Promise.reject(onReject(input[0])))
          .then(() => input[0]),
      logParamData, log_level);
  }

  peek(log, method = () => {
  }, logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) => {
      method(...input);
      return input[0];
    }, logParamData, log_level);
  }

  peekPromiseTimeout(log, method = () => {
  }, maxDuration = 1000, onReject = () => Logger.newFilterError(), logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) =>
        Promise.resolve()
          .then(() => new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(onReject()), maxDuration);

            Promise.resolve()
              .then(() => method(...input))
              .then((resp) => resolve(resp))
              .catch((resp) => reject(resp))
              .finally(() => clearTimeout(timeout));

          }))
          .then(() => method(...input))
          .then(() => input[0]),
      logParamData, log_level);
  }

  peekPromise(log, method = () => {
  }, logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then(() => input[0]),
      logParamData, log_level);
  }

  peekPromiseIf(log, query, method = () => {
  }, logParamData = false, log_level = this._defaultLogLevel) {
    return this.doIf(log, query, (...input) =>
        Promise.resolve()
          .then(() => method(...input))
          .then(() => input[0]),
      logParamData, log_level);
  }

  reportIf(log, query, logParamData = false, log_level = this._defaultLogLevel) {
    return this.doIf(log, query, (...input) => input[0], logParamData, log_level);
  }

  report(log, logParamData = false, log_level = this._defaultLogLevel) {
    return this.do(log, (...input) => input[0], logParamData, log_level);
  }

  query(log_level = this._defaultQueryLogLevel) {
    return (log) => this.report(log, false, log_level)();
  }

  consoleLikeQuery(log_level = this._defaultQueryLogLevel) {
    return {
      debug: this.query(Logger.LOG_LEVELS.DEBUG),
      error: this.query(Logger.LOG_LEVELS.ERROR),
      log: this.query(log_level),
      warn: this.query(Logger.LOG_LEVELS.WARN)
    }
  }

  catchFilter(callback = () => {
  }) {
    return (...err) => {
      if (err[0] instanceof FilterError) {
        // this.report(
        //   `Filtered: ${err.toString()}`,
        //   false,
        //   Logger.LOG_LEVELS.TRACE
        // )();

        return Promise.resolve()
          .then(this.report(
            `Filtered: ${err[0]?.message.toString()}`
          ))
          .then(() => callback(...err));
      } else {
        throw(err[0]);
      }
    }
  }
}

module.exports = Logger;