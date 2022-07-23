const uuid = require('uuid-by-string');

module.exports = class Volume {
  static of(provider) {
    return new Volume(provider);
  }

  constructor(provider) {
    this.provider = provider;
    this.name = '';
    this.pricePerHourPerGiB = 1;
    this.minSizeInGiB = 1;
    this.maxSizeInGiB = 1;
    this.region = null;
    this.id = null;
  }

  setName(i) {
    this.name = i;
    return this;
  }

  setMinSizeInGiB(i) {
    this.minSizeInGiB = i;
    return this;
  }

  setMaxSizeInGiB(i) {
    this.maxSizeInGiB = i;
    return this;
  }

  setPricePerHourPerGiB(i) {
    this.pricePerHourPerGiB = i;
    return this;
  }

  setRegion(i) {
    this.region = i;
    return this;
  }

  generateId() {
    this.id = uuid(JSON.stringify({
      class: 'Volume',
      provider: this.provider,
      name: this.name,
      region: this.region
    }));
    return this;
  }
}