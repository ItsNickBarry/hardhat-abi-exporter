import { name as pluginName } from '../package.json';
import './tasks/clear_abi';
import './tasks/compile';
import './tasks/export_abi';
import './type-extensions.js';
import type { HardhatAbiExporterConfigEntry } from './types.js';
import { extendConfig } from 'hardhat/config';
import { HardhatPluginError } from 'hardhat/plugins';
import 'hardhat/types/config';
import path from 'path';

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
  // `rename` is not defaulted as it may depend on `flat` option
  // `format` is not defaulted as it may depend on `pretty` option
};

extendConfig((config, userConfig) => {
  config.abiExporter = [userConfig.abiExporter].flat().map((el) => {
    const conf = Object.assign({}, DEFAULT_CONFIG, el);

    if (conf.flat && conf.rename) {
      throw new HardhatPluginError(
        pluginName,
        '`flat` & `rename` config cannot be specified together',
      );
    }

    if (conf.pretty && conf.format) {
      throw new HardhatPluginError(
        pluginName,
        '`pretty` & `format` config cannot be specified together',
      );
    }

    if (conf.flat) {
      conf.rename = (sourceName, contractName) => contractName;
    }

    if (!conf.rename) {
      conf.rename = (sourceName, contractName) =>
        path.join(sourceName, contractName);
    }

    if (!conf.format) {
      conf.format = conf.pretty ? 'minimal' : 'json';
    }

    return conf as HardhatAbiExporterConfigEntry;
  });
});
