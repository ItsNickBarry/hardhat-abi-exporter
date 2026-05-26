import { exportAbi } from '../lib/export_abi.js';
import type { SolidityHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<SolidityHooks>> => ({
  processArtifactsAfterSuccessfulBuild: async (
    context,
    artifactPaths,
    buildRootFilePaths,
    buildOptions,
  ) => {
    if (!context.globalOptions.noExportAbi && !context.globalOptions.coverage) {
      const entries = context.config.abiExporter.filter(
        (entry) => entry.runOnCompile,
      );

      await exportAbi(context, entries);
    }
  },
});
