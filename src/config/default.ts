import { AbiExporterConfigEntry } from '../types.js';

const config: Omit<AbiExporterConfigEntry, 'format' | 'rename'> = {
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

export default config;
