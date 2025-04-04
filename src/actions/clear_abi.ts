import { clearAbiGroup } from '../logic.js';
import type { NewTaskActionFunction } from 'hardhat/types/tasks';

type ClearAbiActionArguments = Record<string, never>;

const action: NewTaskActionFunction<ClearAbiActionArguments> = async (
  _,
  hre,
) => {
  const entries = hre.config.abiExporter;

  await Promise.all(
    entries.map((entry) => {
      clearAbiGroup(entry.path);
    }),
  );
};

export default action;
