import { clearAbi } from '../lib/clear_abi.js';
import type { CleanHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<CleanHooks>> => ({
  onClean: async (context) => {
    await clearAbi(context, context.config.abiExporter);
  },
});
