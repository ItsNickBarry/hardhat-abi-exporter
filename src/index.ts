import pkg from '../package.json';
import './type-extensions.js';
import { globalOption, task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: pkg.name.split('/').pop()!,
  npmPackage: pkg.name!,
  tasks: [
    task('export-abi')
      .addFlag({
        name: 'noCompile',
        description: "Don't compile before running this task",
      })
      .setAction(import.meta.resolve('./actions/export/all.js'))
      .build(),

    task('clear-abi')
      .setAction(import.meta.resolve('./actions/clear/all.js'))
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
