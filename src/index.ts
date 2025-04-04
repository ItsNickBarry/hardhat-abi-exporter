import pkg from '../package.json';
import { clearAbiGroupTask, clearAbiTask } from './tasks/clear_abi.js';
import { postCompileTask } from './tasks/compile.js';
import { exportAbiGroupTask, exportAbiTask } from './tasks/export_abi.js';
import './type-extensions.js';
import { globalOption } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const plugin: HardhatPlugin = {
  id: pkg.name,
  tasks: [
    clearAbiTask,
    clearAbiGroupTask,
    exportAbiTask,
    exportAbiGroupTask,
    postCompileTask,
  ],
  hookHandlers: {
    config: import.meta.resolve('./hook_handlers/config.js'),
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
