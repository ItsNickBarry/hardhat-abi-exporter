const { extendConfig } = require('hardhat/config');
const { HardhatPluginError } = require('hardhat/plugins');
const { name: PLUGIN_NAME } = require('./package.json')

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

function validate(config, key, type) {
  if (type === 'array') {
    if (!Array.isArray(config[key])) {
      throw new HardhatPluginError(PLUGIN_NAME, `\`${key}\` config must be an ${type}`)
    }
  } else {
    if (typeof config[key] !== type) {
      throw new HardhatPluginError(PLUGIN_NAME, `\`${key}\` config must be a ${type}`);
    }
  }
}

extendConfig(function (config, userConfig) {
  config.abiExporter = [userConfig.abiExporter].flat().map(function (el) {
    const conf = Object.assign({}, DEFAULT_CONFIG, el);
    validate(conf, 'path', 'string');
    validate(conf, 'runOnCompile', 'boolean');
    validate(conf, 'clear', 'boolean');
    validate(conf, 'flat', 'boolean');
    validate(conf, 'only', 'array');
    validate(conf, 'except', 'array');
    validate(conf, 'spacing', 'number');
    validate(conf, 'pretty', 'boolean');
    validate(conf, 'filter', 'function');
    return conf;
  });
});
