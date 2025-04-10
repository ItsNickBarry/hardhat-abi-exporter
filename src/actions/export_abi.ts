import { exportAbi } from '../lib/export_abi.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

interface ExportAbiActionArguments {
  noCompile: boolean;
}

const action: NewTaskActionFunction<ExportAbiActionArguments> = async (
  args,
  hre,
) => {
  if (hre.globalOptions.noExportAbi) return;

  if (!args.noCompile) {
    hre.globalOptions.noExportAbi = true;
    await hre.tasks.getTask('compile').run();
  }

  await exportAbi(hre, hre.config.abiExporter);
};

export default action;
