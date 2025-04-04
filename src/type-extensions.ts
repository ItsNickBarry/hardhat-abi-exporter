import { AbiExporterConfigEntry, AbiExporterUserConfigEntry } from './types.js';

declare module 'hardhat/types/config' {
  interface HardhatConfig {
    abiExporter: AbiExporterConfigEntry[];
  }

  interface HardhatUserConfig {
    abiExporter?: AbiExporterUserConfigEntry | AbiExporterUserConfigEntry[];
  }
}

declare module 'hardhat/types/global-options' {
  interface GlobalOptions {
    noExportAbi: boolean;
  }
}
