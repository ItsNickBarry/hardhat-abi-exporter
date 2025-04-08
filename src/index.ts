import pkg from '../package.json';
import './type-extensions.js';
import { globalOption, task, overrideTask } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

// TODO: clean hook

const plugin: HardhatPlugin = {
  id: pkg.name.split('/').pop()!,
  npmPackage: pkg.name!,
  tasks: [
    task('export-abi')
      .setDescription(
        'Extract ABIs from compilation artifacts and write to a directory',
      )
      .addFlag({
        name: 'noCompile',
        description: "Don't compile before running this task",
      })
      .setAction(import.meta.resolve('./actions/export_abi.js'))
      .build(),

    task('clear-abi')
      .setDescription('Remove extracted ABIs')
      .setAction(import.meta.resolve('./actions/clear_abi.js'))
      .build(),

    overrideTask('clean')
      .setAction(import.meta.resolve('./actions/clean.js'))
      .build(),
  ],
  hookHandlers: {
    config: import.meta.resolve('./hook_handlers/config.js'),
    solidity: import.meta.resolve('./hook_handlers/solidity.js'),
  },
  globalOptions: [
    globalOption({
      name: 'noExportAbi',
      description: 'Disables ABI exporting',
      defaultValue: false,
      type: ArgumentType.BOOLEAN,
    }),
  ],
};

export default plugin;
