import { clearAbi } from '../logic.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

const action: NewTaskActionFunction = async (_, hre) => {
  await clearAbi(hre, hre.config.abiExporter);
};

export default action;
