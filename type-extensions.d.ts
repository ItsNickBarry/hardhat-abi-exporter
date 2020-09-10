import '@nomiclabs/buidler/types';

declare module '@nomiclabs/buidler/types' {
  interface BuidlerConfig {
    abiExporter?: {
       path?: string;
       only?: string[];
       clear?: boolean;
    };
  }
}
