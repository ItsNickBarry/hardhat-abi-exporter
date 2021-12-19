import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    abiExporter?: {
      path?: string,
      runOnCompile?: boolean,
      clear?: boolean,
      flat?: boolean,
      only?: string[],
      except?: string[],
      spacing?: number,
      pretty?: boolean,
    }
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
    }
  }
}
