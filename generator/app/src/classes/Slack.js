const {WebClient, LogLevel} = require('@slack/web-api');
const stripAnsi = require('strip-ansi');

class Slack {

  static CHANNELS = {
    ERRORS: process.env.SLACK_CHANNEL
  }

  constructor() {
    this.token = process.env.SLACK_TOKEN;
    this.client = new WebClient(this.token, {
      logLevel: LogLevel.WARN,
      retryConfig: {
        retries: 0
      },
      timeout: 2000,
      rejectRateLimitedCalls: true
    });

    this.CHANNELS = Slack.CHANNELS;
  }

  postMessage(channel, message) {
    if (!process.env.SLACK_TOKEN) {
      console.error(`Wanted to report error to slack, but no \`SLACK_TOKEN\` environment was defined.`);
      return Promise.resolve();
    }

    if (!process.env.SLACK_CHANNEL) {
      console.error(`Wanted to report error to slack, but no \`SLACK_CHANNEL\` environment was defined.`);
      return Promise.resolve();
    }

    return this.client?.chat?.postMessage({channel: channel, text: stripAnsi(message)})
      ?.catch((err) => console.error(`Slack error: ${err.toString()}`));
  }
}

module.exports = new Slack();