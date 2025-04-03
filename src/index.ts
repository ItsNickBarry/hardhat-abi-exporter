import pkg from '../package.json' with { type: 'json' };
import { clearAbiGroupTask, clearAbiTask } from './tasks/clear_abi.js';
import { postCompileTask } from './tasks/compile.js';
import { exportAbiGroupTask, exportAbiTask } from './tasks/export_abi.js';
import './type-extensions.js';
import type { HardhatPlugin } from 'hardhat/types/plugins';

const hardhatPlugin: HardhatPlugin = {
  id: pkg.name,
  tasks: [
    clearAbiTask,
    clearAbiGroupTask,
    exportAbiTask,
    exportAbiGroupTask,
    postCompileTask,
  ],
  hookHandlers: {
    config: import.meta.resolve('./hook-handlers/config.js'),
  },
};

export default hardhatPlugin;
