import hre from 'hardhat';
import type { SolidityHooks } from 'hardhat/types/hooks';

export default async (): Promise<Partial<SolidityHooks>> => ({
  onCleanUpArtifacts: async (context, artifactPaths, next) => {
    // TODO: skip if solidity coverage running
    if (!context.globalOptions.noExportAbi) {
      const entries = context.config.abiExporter.filter(
        (entry) => entry.runOnCompile,
      );

      await Promise.all(
        entries.map((entry) =>
          hre.tasks.getTask(['export-abi', 'group']).run({ path: entry.path }),
        ),
      );
    }

    return next(context, artifactPaths);
  },
});
