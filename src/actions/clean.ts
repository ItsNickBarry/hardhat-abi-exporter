import { clearAbiGroup } from '../logic.js';
import type { TaskOverrideActionFunction } from 'hardhat/types/tasks';

const action: TaskOverrideActionFunction = async (args, hre, runSuper) => {
  await runSuper(args);

  const entries = hre.config.abiExporter.filter((c) => c.clear);

  await Promise.all(
    entries.map((entry) => {
      clearAbiGroup(hre, entry);
    }),
  );
};

export default action;
