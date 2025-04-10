import { clearAbi } from '../lib/clear_abi.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

const action: NewTaskActionFunction = async (_, hre) => {
  await clearAbi(hre, hre.config.abiExporter);
};

export default action;
