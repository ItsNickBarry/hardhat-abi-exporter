const { extendConfig } = require('hardhat/config');

require('./tasks/clear_abi.js');
require('./tasks/export_abi.js');
require('./tasks/compile.js');

function withDefaults(abiExporterConfig) {
  return Object.assign(
    {
      path: './abi',
      runOnCompile: false,
      clear: false,
      flat: false,
      only: [],
      except: [],
      spacing: 2,
      pretty: false,
      filter: () => true,
    },
    abiExporterConfig
  );
}

extendConfig(function (config, userConfig) {
  let abiExporterConfig = userConfig.abiExporter;
  if (!Array.isArray(abiExporterConfig)) {
    abiExporterConfig = [abiExporterConfig];
  }

  config.abiExporter = abiExporterConfig.map(withDefaults);
});
