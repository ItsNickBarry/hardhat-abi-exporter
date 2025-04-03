import type { NewTaskActionFunction } from 'hardhat/types/tasks';

type ClearAbiActionArguments = Record<string, never>;

const action: NewTaskActionFunction<ClearAbiActionArguments> = async (
  _,
  hre,
) => {
  const configs = hre.config.abiExporter;

  await Promise.all(
    configs.map((abiExporterConfig) => {
      return hre.tasks.getTask(['clear-abi', 'group']).run({
        path: abiExporterConfig.path,
      });
    }),
  );
};

export default action;
