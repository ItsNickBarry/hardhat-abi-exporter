import pkg from '../package.json' with { type: 'json' };
import taskAbi from './tasks/abi.js';
import taskAbiClean from './tasks/abi_clean.js';
import taskAbiExport from './tasks/abi_export.js';
import './type_extensions.js';
import { globalOption } from 'hardhat/config';
import { definePlugin } from 'hardhat/plugins';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = definePlugin({
  id: pkg.name!,
  npmPackage: pkg.name!,
  dependencies: () => [import('@solidstate/hardhat-solidstate-utils')],
  tasks: [taskAbi, taskAbiClean, taskAbiExport],
  hookHandlers: {
    clean: () => import('./hooks/clean.js'),
    config: () => import('./hooks/config.js'),
    solidity: () => import('./hooks/solidity.js'),
  },
  globalOptions: [
    globalOption({
      name: 'noExportAbi',
      description: 'Disables ABI exporting',
      defaultValue: false,
      type: ArgumentType.BOOLEAN,
    }),
  ],
});

export default plugin;
