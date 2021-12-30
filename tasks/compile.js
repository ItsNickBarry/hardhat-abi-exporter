const {
  TASK_COMPILE,
} = require('hardhat/builtin-tasks/task-names');

task(TASK_COMPILE).addFlag(
  'noExportAbi', 'Don\'t export ABI after running this task, even if runOnCompile option is enabled'
).setAction(async function (args, hre, runSuper) {
  await runSuper();

  if (hre.config.abiExporter.runOnCompile && !args.noExportAbi) {
    // Disable compile to avoid an infinite loop
    await hre.run('export-abi', { noCompile: true });
  }
});
