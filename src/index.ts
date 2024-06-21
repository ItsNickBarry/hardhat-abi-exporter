import { name as pluginName } from '../package.json';
import './tasks/clear_abi';
import './tasks/compile';
import './tasks/export_abi';
import { extendConfig } from 'hardhat/config';
import { HardhatPluginError } from 'hardhat/plugins';
import 'hardhat/types/config';
import path from 'path';

interface AbiExporterUserConfigEntry {
  path?: string;
  runOnCompile?: boolean;
  clear?: boolean;
  flat?: boolean;
  only?: string[];
  except?: string[];
  spacing?: number;
  pretty?: boolean;
  format?: string;
  filter?: (
    abiElement: any,
    index: number,
    abi: any,
    fullyQualifiedName: string,
  ) => boolean;
  rename?: (sourceName: string, contractName: string) => string;
}

interface AbiExporterConfigEntry {
  path: string;
  runOnCompile: boolean;
  clear: boolean;
  flat: boolean;
  only: string[];
  except: string[];
  spacing: number;
  pretty?: boolean;
  format?: string;
  filter: (
    abiElement: any,
    index: number,
    abi: any,
    fullyQualifiedName: string,
  ) => boolean;
  rename: (sourceName: string, contractName: string) => string;
}

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    abiExporter?: AbiExporterUserConfigEntry | AbiExporterUserConfigEntry[];
  }

  interface HardhatConfig {
    abiExporter: AbiExporterConfigEntry[];
  }
}

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

function validate(
  config: AbiExporterUserConfigEntry,
  key: keyof AbiExporterUserConfigEntry,
  type: string,
) {
  if (type === 'array') {
    if (!Array.isArray(config[key])) {
      throw new HardhatPluginError(
        pluginName,
        `\`${key}\` config must be an ${type}`,
      );
    }
  } else {
    if (typeof config[key] !== type) {
      throw new HardhatPluginError(
        pluginName,
        `\`${key}\` config must be a ${type}`,
      );
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

    if (conf.flat && typeof conf.rename !== 'undefined') {
      throw new HardhatPluginError(
        pluginName,
        '`flat` & `rename` config cannot be specified together',
      );
    }

    if (conf.pretty && typeof conf.format !== 'undefined') {
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

    validate(conf, 'rename', 'function');

    if (!conf.format) {
      conf.format = conf.pretty ? 'minimal' : 'json';
    }

    validate(conf, 'format', 'string');

    return conf as AbiExporterConfigEntry;
  });
});
