const { extendConfig } = require('hardhat/config');

require('./tasks/clear_abi.js');
require('./tasks/export_abi.js');
require('./tasks/compile.js');

const DEFAULT_CONFIG = {
  path: './abi',
  runOnCompile: false,
  clear: false,
  flat: false,
  only: [],
  except: [],
  spacing: 2,
  pretty: false,
  filter: () => true,
};

extendConfig(function (config, userConfig) {
  config.abiExporter = [userConfig.abiExporter].flat().map(function (el) {
    return Object.assign({}, DEFAULT_CONFIG, el);
  });
});
