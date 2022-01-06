import 'hardhat/types/config';

interface AbiExporterUserConfig {
  path?: string,
  runOnCompile?: boolean,
  clear?: boolean,
  flat?: boolean,
  only?: string[],
  except?: string[],
  spacing?: number,
  pretty?: boolean,
  filter?: (abiElement: any, index: number, abi: any, fullyQualifiedName: string) => boolean,
}

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    abiExporter?: AbiExporterUserConfig | AbiExporterUserConfig[]
  }

  interface HardhatConfig {
    abiExporter: {
      path: string,
      runOnCompile: boolean,
      clear: boolean,
      flat: boolean,
      only: string[],
      except: string[],
      spacing: number,
      pretty: boolean,
      filter: (abiElement: any, index: number, abi: any, fullyQualifiedName: string) => boolean,
    }[]
  }
}
