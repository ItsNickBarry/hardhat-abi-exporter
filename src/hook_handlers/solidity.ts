import { exportAbi } from '../logic.js';
import type { SolidityHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<SolidityHooks>> => ({
  onCleanUpArtifacts: async (context, artifactPaths, next) => {
    // TODO: skip if solidity coverage running
    if (!context.globalOptions.noExportAbi) {
      const entries = context.config.abiExporter.filter(
        (entry) => entry.runOnCompile,
      );

      await exportAbi(context, entries);
    }

    return next(context, artifactPaths);
  },
});
