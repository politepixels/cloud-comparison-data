const uuid = require('uuid-by-string');

module.exports = class Region {
  static of(provider) {
    return new Region(provider);
  }

  constructor(provider) {
    this.provider = provider;
    this.name = null;
    this.availabilityZones = [];
    this.zoneName = null;
    this.city = null;
    this.countryCode = null;
    this.description = null;
    this.latitude = null;
    this.longitude = null;
    this.id = null;
  }

  setAvailabilityZones(i) {
    this.availabilityZones = i;
    return this;
  }

  setName(i) {
    this.name = i;
    return this;
  }

  setZoneName(i) {
    this.zoneName = i;
    return this;
  }

  setCity(i) {
    this.city = i;
    return this;
  }

  setCountryCode(i) {
    this.countryCode = i;
    return this;
  }

  setDescription(i) {
    this.description = i;
    return this;
  }

  setLatitude(i) {
    this.latitude = i;
    return this;
  }

  setLongitude(i) {
    this.longitude = i;
    return this;
  }

  generateId() {
    this.id = uuid(JSON.stringify({
      class: 'Region',
      provider: this.provider,
      name: this.name
    }));
    return this;
  }
}