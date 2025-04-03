import { AbiExporterConfigEntry } from './index.js';

export interface HardhatAbiExporterConfigEntry {
  path: string;
  runOnCompile: boolean;
  clear: boolean;
  flat: boolean;
  only: string[];
  except: string[];
  spacing: number;
  pretty: boolean;
  format: string;
  filter: (
    abiElement: any,
    index: number,
    abi: any,
    fullyQualifiedName: string,
  ) => boolean;
  rename: (sourceName: string, contractName: string) => string;
}

export type HardhatAbiExporterConfig =
  | AbiExporterConfigEntry
  | AbiExporterConfigEntry[];

export type HardhatAbiExporterUserConfig = Partial<HardhatAbiExporterConfig>;
