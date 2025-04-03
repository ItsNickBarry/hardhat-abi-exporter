import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface ExportAbiActionArguments {
  noCompile: boolean;
}

const action: NewTaskActionFunction<ExportAbiActionArguments> = async (
  args,
  hre,
) => {
  if (!args.noCompile) {
    await hre.tasks.getTask('compile').run({ noExportAbi: true });
  }

  const configs = hre.config.abiExporter;

  await Promise.all(
    configs.map((abiGroupConfig) => {
      return hre.tasks.getTask(['export-abi', 'group']).run({
        path: abiGroupConfig.path,
      });
    }),
  );
};

export default action;
