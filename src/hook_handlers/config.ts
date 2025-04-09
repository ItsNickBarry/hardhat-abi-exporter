import type { AbiExporterConfigEntry } from '../types.js';
import type {
  ConfigHooks,
  HardhatUserConfigValidationError,
} from 'hardhat/types/hooks';
import path from 'path';

const DEFAULT_CONFIG: Omit<AbiExporterConfigEntry, 'format' | 'rename'> = {
  path: './abi',
  runOnCompile: false,
  clear: false,
  flat: false,
  tsWrapper: false,
  only: [],
  except: [],
  spacing: 2,
  pretty: false,
  filter: () => true,
  // `rename` is not defaulted as it may depend on `flat` option
  // `format` is not defaulted as it may depend on `pretty` option
};

export default async (): Promise<Partial<ConfigHooks>> => ({
  validateUserConfig: async (userConfig) => {
    const errors: HardhatUserConfigValidationError[] = [];

    const configEntries = [userConfig.abiExporter ?? []].flat();

    for (let i = 0; i < configEntries.length; i++) {
      const entry = configEntries[i];

      if (entry.flat && entry.rename) {
        errors.push({
          path: ['abiExporter', i, 'flat'],
          message: '`flat` & `rename` config cannot be specified together',
        });
      }

      if (entry.pretty && entry.format) {
        errors.push({
          path: ['abiExporter', i, 'pretty'],
          message: '`pretty` & `format` config cannot be specified together',
        });
      }

      if (
        entry.format &&
        !['json', 'minimal', 'full', 'typescript'].includes(entry.format)
      ) {
        errors.push({
          path: ['abiExporter', i, 'format'],
          message: `invalid format: ${entry.format}`,
        });
      }
    }

    // remove the config entry index if the user config is not an array

    if (!Array.isArray(userConfig.abiExporter)) {
      for (const error of errors) {
        error.path.splice(1, 1);
      }
    }

    return errors;
  },

  resolveUserConfig: async (userConfig, resolveConfigurationVariable, next) => {
    const resolvedConfig = await next(userConfig, resolveConfigurationVariable);

    const result: AbiExporterConfigEntry[] = [];

    for (const userConfigEntry of [userConfig.abiExporter ?? []].flat()) {
      const entry = Object.assign({}, DEFAULT_CONFIG, userConfigEntry);

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
