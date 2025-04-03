import { task } from 'hardhat/config';
import { ArgumentType } from 'hardhat/types/arguments';

export const clearAbiTask = task('clear-abi')
  .setAction(import.meta.resolve('../actions/clear/all.js'))
  .build();

export const clearAbiGroupTask = task(['clear-abi', 'group'])
  .addPositionalArgument({
    name: 'path',
    description: 'path to look for ABIs',
    type: ArgumentType.STRING,
    defaultValue: undefined,
  })
  .setAction(import.meta.resolve('../actions/clear/group.js'))
  .build();
