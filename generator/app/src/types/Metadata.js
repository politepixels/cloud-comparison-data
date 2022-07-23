const uuid = require('uuid-by-string');

module.exports = class Metadata {
  static of(provider) {
    return new Metadata(provider);
  }

  constructor(provider) {
    this.provider = provider;

    this.name = '';
    this.url = '';
    this.referral = '';
    this.id = null;
  }

  setName(i) {
    this.name = i;
    return this;
  }

  setUrl(i) {
    this.url = i;
    return this;
  }

  setReferral(i) {
    this.referral = i;
    return this;
  }

  generateId() {
    this.id = uuid(JSON.stringify({
      class: 'Metadata',
      provider: this.provider
    }));
    return this;
  }
}