import { exportAbiGroup } from '../../logic.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface ExportAbiActionArguments {
  noCompile: boolean;
}

const action: NewTaskActionFunction<ExportAbiActionArguments> = async (
  args,
  hre,
) => {
  if (!args.noCompile) {
    hre.globalOptions.noExportAbi = true;
    await hre.tasks.getTask('compile').run({ noExportAbi: true });
  }

  const entries = hre.config.abiExporter;

  await Promise.all(
    entries.map((entry) => {
      exportAbiGroup(hre, entry);
    }),
  );
};

export default action;
