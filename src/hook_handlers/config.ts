import defaultConfig from '../config/default.js';
import type {
  AbiExporterConfigEntry,
  AbiExporterUserConfigEntry,
} from '../types.js';
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
  validateUserConfig: async (userConfig) => {
    const errors: HardhatUserConfigValidationError[] = [];

    for (const entry of toArray(userConfig.abiExporter)) {
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
    const abiExporter = toArray(userConfig.abiExporter);

    const result: AbiExporterConfigEntry[] = [];

    for (let i = 0; i < abiExporter.length; i++) {
      const entry = Object.assign({}, defaultConfig, abiExporter[i]);

      result.push({
        ...entry,
        format: (entry.format ?? entry.pretty) ? 'minimal' : 'json',
        rename:
          entry.rename ??
          (entry.flat
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
