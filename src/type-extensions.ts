import {
  HardhatAbiExporterConfig,
  HardhatAbiExporterUserConfig,
} from './types.js';

declare module 'hardhat/types/config' {
  interface HardhatConfig {
    abiExporter: HardhatAbiExporterConfig;
  }

  interface HardhatUserConfig {
    abiExporter?: HardhatAbiExporterUserConfig;
  }
}
