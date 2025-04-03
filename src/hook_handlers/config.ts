import defaultConfig from '../config/default.js';
import type {
  AbiExporterConfigEntry,
  AbiExporterUserConfigEntry,
} from '../types.js';
import type {
  ConfigurationVariable,
  HardhatConfig,
  HardhatUserConfig,
  ResolvedConfigurationVariable,
} from 'hardhat/types/config';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';
import path from 'path';

function toArray(
  abiExporter:
    | undefined
    | AbiExporterUserConfigEntry
    | AbiExporterUserConfigEntry[],
) {
  if (abiExporter == null) return [];
  if (Array.isArray(abiExporter)) {
    return abiExporter;
  }
  return [abiExporter];
}

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (
    userConfig: HardhatUserConfig,
  ): Promise<HardhatUserConfigValidationError[]> => {
    const errors: HardhatUserConfigValidationError[] = [];
    for (const conf of toArray(userConfig.abiExporter)) {
      if (conf.flat && conf.rename) {
        errors.push({
          path: ['abiExporter', 'flat'],
          message: '`flat` & `rename` config cannot be specified together',
        });
      }

      if (conf.pretty && conf.format) {
        errors.push({
          path: ['abiExporter', 'pretty'],
          message: '`pretty` & `format` config cannot be specified together',
        });
      }
    }
    return errors;
  },

  resolveUserConfig: async (
    userConfig: HardhatUserConfig,
    resolveConfigurationVariable: (
      variableOrString: ConfigurationVariable | string,
    ) => ResolvedConfigurationVariable,
    next: (
      nextUserConfig: HardhatUserConfig,
      nextResolveConfigurationVariable: (
        variableOrString: ConfigurationVariable | string,
      ) => ResolvedConfigurationVariable,
    ) => Promise<HardhatConfig>,
  ): Promise<HardhatConfig> => {
    const resolvedConfig = await next(userConfig, resolveConfigurationVariable);
    const abiExporter = toArray(userConfig.abiExporter);

    const result: AbiExporterConfigEntry[] = [];
    for (let i = 0; i < abiExporter.length; i++) {
      const conf = Object.assign({}, defaultConfig, abiExporter[i]);

      result.push({
        ...conf,
        format: (conf.format ?? conf.pretty) ? 'minimal' : 'json',
        rename:
          conf.rename ??
          (conf.flat
            ? (sourceName, contractName) => contractName
            : (sourceName, contractName) =>
                path.join(sourceName, contractName)),
      });
    }

    return {
      ...resolvedConfig,
      abiExporter: result,
    };
  },
});
