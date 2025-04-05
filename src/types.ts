export interface AbiExporterUserConfigEntry {
  path?: string;
  runOnCompile?: boolean;
  clear?: boolean;
  flat?: boolean;
  tsWrapper?: boolean;
  only?: string[];
  except?: string[];
  spacing?: number;
  pretty?: boolean;
  format?: 'minimal' | 'full' | 'json' | 'typescript';
  filter?: (
    abiElement: any,
    index: number,
    abi: any,
    fullyQualifiedName: string,
  ) => boolean;
  rename?: (sourceName: string, contractName: string) => string;
}

export type AbiExporterConfigEntry = Required<AbiExporterUserConfigEntry>;
