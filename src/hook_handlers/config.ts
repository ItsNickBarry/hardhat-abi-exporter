import defaultConfig from '../config/default.js';
import type { AbiExporterConfigEntry } from '../types.js';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';
import path from 'path';

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (userConfig) => {
    const errors: HardhatUserConfigValidationError[] = [];

    for (const entry of [userConfig.abiExporter ?? []].flat()) {
      if (entry.flat && entry.rename) {
        errors.push({
          path: ['abiExporter', 'flat'],
          message: '`flat` & `rename` config cannot be specified together',
        });
      }

      if (entry.pretty && entry.format) {
        errors.push({
          path: ['abiExporter', 'pretty'],
          message: '`pretty` & `format` config cannot be specified together',
        });
      }
    }

    return errors;
  },

  resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
    const resolvedConfig = await next(userConfig, resolveConfigurationVariable);

    const result: AbiExporterConfigEntry[] = [];

    for (const userConfigEntry of [userConfig.abiExporter ?? []].flat()) {
      const entry = Object.assign({}, defaultConfig, userConfigEntry);

      const rename =
        entry.rename ??
        (entry.flat
          ? (sourceName, contractName) => contractName
          : (entry.rename = (sourceName, contractName) =>
              path.join(sourceName, contractName)));

      const format = entry.format ?? (entry.pretty ? 'minimal' : 'json');

      result.push({
        ...entry,
        format,
        rename,
      });
    }

    return {
      ...resolvedConfig,
      abiExporter: result,
    };
  },
});
