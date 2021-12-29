const { extendConfig } = require('hardhat/config');

require('./tasks/clear_abi.js');
require('./tasks/export_abi.js');
require('./tasks/compile.js');

extendConfig(function (config, userConfig) {
  config.abiExporter = Object.assign(
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
    userConfig.abiExporter
  );
});
