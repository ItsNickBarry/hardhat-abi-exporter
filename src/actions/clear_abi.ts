import { clearAbi } from '../logic.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

type ClearAbiActionArguments = Record<string, never>;

const action: NewTaskActionFunction<ClearAbiActionArguments> = async (
  _,
  hre,
) => {
  await clearAbi(hre, hre.config.abiExporter);
};

export default action;
