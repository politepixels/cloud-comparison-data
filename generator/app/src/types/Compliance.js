const uuid = require('uuid-by-string');

module.exports = class Compliance {
  static of(provider) {
    return new Compliance(provider);
  }

  constructor(provider) {
    this.provider = provider;

    this.name = '';
    this.url = '';
    this.region = null;
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

  setRegion(i) {
    this.region = i;
    return this;
  }

  generateId() {
    this.id = uuid(JSON.stringify({
      class: 'Compliance',
      provider: this.provider,
      name: this.name
    }));
    return this;
  }
}