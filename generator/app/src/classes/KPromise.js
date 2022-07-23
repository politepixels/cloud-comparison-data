const Logger = require(`${__basedir}/classes/Logger`);
const merge = require(`deepmerge`);
const util = require(`util`);
const LRU_TTL = require('lru-ttl-cache').default;
const short = require('short-uuid');

class KPromise extends Promise {

  static STORE = new LRU_TTL({
    max: 100000,
    maxBytes: `2gb`,
    ttl: `30m`,
    ttlInterval: 1000 * 60
  });

  static start(logger = Logger.of(`kpromise`), data = null) {
    return new KPromise((resolve, reject) => resolve(data), logger);
  }

  static fail(logger = Logger.of(`kpromise`), data = null) {
    return new KPromise((resolve, reject) => reject(data), logger);
  }

  static sequential(promiseFns) {
    return promiseFns.reduce(
      (acc, result) => acc.then(response => result().then(r => response.concat(r))),
      Promise.resolve([])
    )
  }

  constructor(executor, logger = Logger.of(`kpromise`)) {
    super(executor);
    this.logger = logger;
    this._state = short.generate();

    if (!KPromise.STORE.has(this._state)) {
      KPromise.STORE.set(this._state, {});
      KPromise.STORE._ttlP.unref();
    }
  }

  _setLogger(logger) {
    this.logger = logger;
    return this;
  }

  _setState(state) {
    this._state = state;
    return this;
  }

  _getState() {
    const state = KPromise.STORE.get(this._state);
    return !!state && typeof state === `object` && !Array.isArray(state) && Object.getPrototypeOf(state) === Object.prototype ? state : {};
  }

  extend(newSubContext = ``) {
    return KPromise.start(this.logger.extend(newSubContext));
  }

  do(method, logParamData = false) {
    return this.then((input) => this.logger.do(null, method, logParamData)(input, this._getState()));
  }

  doIf(query, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.doIf(null, query, method, logParamData, log_level)(input, this._getState()));
  }

  doLog(log, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.do(log, method, logParamData, log_level)(input, this._getState()));
  }

  doIfLog(log, query, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.doIf(log, query, method, logParamData, log_level)(input, this._getState()));
  }

  record(name, method, logParamData = false) {
    return this.then((input) => this.logger.record(null, name, method, logParamData)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordIf(name, query, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.recordIf(null, name, query, method, logParamData, log_level)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordLog(log, name, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.record(log, name, method, logParamData, log_level)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordIfLog(log, name, query, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.recordIf(log, name, query, method, logParamData, log_level)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordRequire(name, method, onReject = undefined, logParamData = false) {
    return this.then((input) => this.logger.recordRequire(null, name, method, onReject, logParamData)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordRequireIf(name, query, method, onReject = undefined, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.recordRequireIf(null, name, query, method, onReject, logParamData, log_level)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordRequireLog(log, name, method, onReject = undefined, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.recordRequire(log, name, method, onReject, logParamData, log_level)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  recordRequireIfLog(log, name, query, method, onReject = undefined, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.recordRequireIf(log, name, query, method, onReject, logParamData, log_level)(input, this._getState()))
      .then((result) => !!KPromise.STORE.set(this._state, result) && result);
  }

  filter(method, onReject = () => Logger.newFilterError(), logParamData = false) {
    return this.then((input) => this.logger.filter(null, method, onReject, logParamData)(input, this._getState()));
  }

  filterLog(log, method, onReject = () => Logger.newFilterError(), logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.filter(log, method, onReject, logParamData, log_level)(input, this._getState()));
  }

  filterPoll(method, interval = 30, maxDuration = 600, onReject = () => Logger.newFilterError(), logParamData = false) {
    return this.then((input) => this.logger.filterPoll(null, method, onReject, logParamData)(input, this._getState()));
  }

  filterPollLog(log, method, interval = 30, maxDuration = 600, onReject = () => Logger.newFilterError(), logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.filterPoll(log, method, interval, maxDuration, onReject, logParamData, log_level)(input, this._getState()));
  }

  filterPollIf(log, query, method, interval = 30, maxDuration = 600, onReject = () => Logger.newFilterError(), logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.filterIfPoll(null, query, method, interval, maxDuration, onReject, logParamData, log_level)(input, this._getState()));
  }

  filterPollIfLog(log, query, method, interval = 30, maxDuration = 600, onReject = () => Logger.newFilterError(), logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.filterIfPoll(log, query, method, interval, maxDuration, onReject, logParamData, log_level)(input, this._getState()));
  }

  peek(method, logParamData = false) {
    return this.then((input) => this.logger.peekPromise(null, method, logParamData)(input, this._getState()));
  }

  peekLog(log, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.peekPromise(log, method, logParamData, log_level)(input, this._getState()));
  }

  peekLogTimeout(log, method, maxDuration, onReject = () => Logger.newFilterError(), logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.peekPromise(log, method, logParamData, log_level)(input, this._getState()));
  }

  peekIf(query, method, logParamData = false) {
    return this.then((input) => this.logger.peekPromiseIf(null, query, method, logParamData)(input, this._getState()));
  }

  peekIfLog(log, query, method, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.peekPromiseIf(log, query, method, logParamData, log_level)(input, this._getState()));
  }

  reportIfLog(log, query, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.reportIf(log, query, logParamData, log_level)(input, this._getState()));
  }

  reportLog(log, logParamData = false, log_level = undefined) {
    return this.then((input) => this.logger.report(log, logParamData, log_level)(input, this._getState()));
  }

  catchFilter(callback = () => {
  }) {
    return this.catch((input) => this.logger.catchFilter(callback)(input, this._getState()));
  }

  catchReportLog(log, logParamData = false, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((input) => this.logger.report(log, logParamData, log_level)(input, this._getState()));
  }

  catchReportDataLog(data, logParamData = true, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((err) => this.logger.report(err, logParamData, log_level)(merge(data, {
      err: util.inspect(err, false, null, false)
    }), this._getState()));
  }

  catchDo(method, logParamData = false) {
    return this.catch((input) => this.logger.do(null, method, logParamData)(input, this._getState()));
  }

  catchDoLog(log, method, logParamData = false, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((input) => this.logger.do(log, method, logParamData, log_level)(input, this._getState()));
  }

  catchBubbleReportLog(log, logParamData = false, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((err) => {
      this.logger.report(log, logParamData, log_level)(err, this._getState());
      throw err;
    });
  }

  catchBubbleReportDataLog(data, logParamData = true, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((err) => {
      this.logger.report(err, logParamData, log_level)(merge(data, {
        err: util.inspect(err, false, null, false)
      }), this._getState());
      throw err;
    });
  }

  catchBubbleDo(method, logParamData = false) {
    return this.catch((err) => {
      this.logger.do(null, method, logParamData)(err, this._getState());
      throw err;
    });
  }

  catchBubbleDoLog(log, method, logParamData = false, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((err) => {
      this.logger.do(log, method, logParamData, log_level)(err, this._getState());
      throw err;
    });
  }

  catchIfErrorTypeThrowLog(log, errorType, method, logParamData = false, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((err) => {
      if (typeof errorType === `string` ? err.name.toString() === errorType : err instanceof errorType) {
        return this.logger.report(log, logParamData, log_level)(err, this._getState())
          .then(() => method(err, this._getState()))
          .then((err) => {throw err});
      } else {
        throw err;
      }
    });
  }

  catchIfErrorTypeDoLog(log, errorType, method, logParamData = false, log_level = Logger.LOG_LEVELS.ERROR) {
    return this.catch((err) => {
      if (typeof errorType === `string` ? err.name.toString() === errorType : err instanceof errorType) {
        return this.logger.do(log, method, logParamData, log_level)(err, this._getState());
      } else {
        throw err;
      }
    });
  }

  finallyReportLog(log, logParamData = false, log_level = undefined) {
    return this.finally(() => this.logger.report(log, logParamData, log_level)(this._getState()));
  }

  finallyDo(method, logParamData = false) {
    return this.finally(() => this.logger.do(null, method, logParamData)(this._getState()));
  }

  finallyDoLog(log, method, logParamData = false, log_level = undefined) {
    return this.finally(() => this.logger.do(log, method, logParamData, log_level)(this._getState()));
  }

  then(...params) {
    return super.then(...params)
      ._setLogger(this.logger)
      ._setState(this._state);
  }

  catch(...params) {
    return super.catch(...params)
      ._setLogger(this.logger)
      ._setState(this._state);
  }

  finally(...params) {
    return super.finally(...params)
      ._setLogger(this.logger)
      ._setState(this._state);
  }

  cleanupDoLog(log, method, logParamData = false, log_level = undefined) {
    return this.finally(() => this.logger.do(log, method, logParamData, log_level)(this._getState()))
      .finally(() => KPromise.STORE.delete(this._state));
  }

  cleanup() {
    return this.finally(() => KPromise.STORE.delete(this._state));
  }
}

module.exports = KPromise;