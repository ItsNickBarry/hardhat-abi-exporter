import 'hardhat/types/config';

declare module 'hardhat/types/config' {
  interface HardhatUserConfig {
    abiExporter?: {
      path?: string,
      clear?: boolean,
      flat?: boolean,
      only?: string[],
      except?: string[],
      spacing?: number,
    }
  }

  interface HardhatConfig {
    abiExporter: {
      path: string,
      clear: boolean,
      flat: boolean,
      only: string[],
      except: string[],
      spacing: number
    }
  }
}
