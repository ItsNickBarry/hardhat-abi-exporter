import { TASK_CLEAN } from 'hardhat/builtin-tasks/task-names';
import { task } from 'hardhat/config';

task(TASK_CLEAN).setAction(async (args, hre, runSuper) => {
  await runSuper();

  const configs = hre.config.abiExporter.filter((c) => c.clear);

  await Promise.all(
    configs.map(async (config) =>
      hre.run('clear-abi-group', { path: config.path }),
    ),
  );
});
