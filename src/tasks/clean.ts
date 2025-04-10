import { overrideTask } from 'hardhat/config';

export default overrideTask('clean')
  .setAction(import.meta.resolve('../actions/clean.js'))
  .build();
