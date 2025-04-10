import { clearAbi } from '../lib/clear_abi.js';
import type { TaskOverrideActionFunction } from 'hardhat/types/tasks';

const action: TaskOverrideActionFunction = async (args, hre, runSuper) => {
  await runSuper(args);

  await clearAbi(hre, hre.config.abiExporter);
};

export default action;
