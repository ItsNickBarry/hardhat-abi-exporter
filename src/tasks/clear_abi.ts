import { task } from 'hardhat/config';

export default task('clear-abi')
  .setDescription('Remove extracted ABIs')
  .setAction(import.meta.resolve('../actions/clear_abi.js'))
  .build();
