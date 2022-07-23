const KPromise = require(`${__basedir}/classes/KPromise`);
const Logger = require(`${__basedir}/classes/Logger`);

const Server = require(`${__basedir}/types/Server`);

const fs = require('fs');
const axios = require("axios");

const log = Logger.of(`hetzner.server`);

module.exports = () => KPromise.start(log)
  .recordRequireLog(
    `Retrieving Data From API`,
    `servers_response`,
    () => axios.get("https://api.hetzner.cloud/v1/server_types", {
      headers: {
        'Authorization': `Bearer ${process.env.HETZNER_API_KEY}`
      }
    })
  )
  .recordRequireLog(
    `Parsing Response`,
    `servers_raw`,
    ({servers_response}) => servers_response?.data?.server_types || []
  )
  .recordRequireLog(
    `Normalising`,
    `servers`,
    ({servers_raw}) => servers_raw.flatMap((server) =>
      server.prices.map((server_price) =>
        Server.of(`hetzner`)
          .setName(server.name)
          .setDescription(server.description)
          .setVCpu(server.cores)
          .setMemoryInGiB(server.memory)
          .setDiskInGiB(server.disk)
          .setDeprecated(!!server.deprecated)
          .setCpuShared(server.cpu_type === 'shared')
          .setRegion(server_price.location)
          .setPricePerHour(server_price.price_hourly.gross)
          .generateId()
      )
    )
  )
  .peekLog(
    `Write to file`,
    ({servers}) => fs.writeFileSync(`${global.__datadir}/hetzner/servers.yaml`, JSON.stringify(servers, null, 2), 'utf8')
  )
  .doLog(`Finished`, ({servers}) => Promise.resolve(servers))
  .catchBubbleReportLog(`Fatal Error`, true)
  .cleanup();