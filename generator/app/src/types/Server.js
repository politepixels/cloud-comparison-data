const uuid = require('uuid-by-string');

module.exports = class Server {
  static of(provider) {
    return new Server(provider);
  }

  constructor(provider) {
    this.provider = provider;
    this.name = '';
    this.description = '';
    this.vcpu = 0;
    this.memoryInGiB = 0;
    this.diskInGiB = 0;
    this.deprecated = false;
    this.pricePerHour = 1;
    this.cpuShared = false;
    this.region = null;
    this.id = null;
  }

  setName(i) {
    this.name = i;
    return this;
  }

  setDescription(i) {
    this.description = i;
    return this;
  }

  setVCpu(i) {
    this.vcpu = i;
    return this;
  }

  setMemoryInGiB(i) {
    this.memoryInGiB = i;
    return this;
  }

  setDiskInGiB(i) {
    this.diskInGiB = i;
    return this;
  }

  setDeprecated(i) {
    this.deprecated = i;
    return this;
  }

  setPricePerHour(i) {
    this.pricePerHour = i;
    return this;
  }

  setCpuShared(i) {
    this.cpuShared = i;
    return this;
  }

  setRegion(i) {
    this.region = i;
    return this;
  }

  generateId() {
    this.id = uuid(JSON.stringify({
      class: 'Server',
      provider: this.provider,
      name: this.name,
      region: this.region
    }));
    return this;
  }
}