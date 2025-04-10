import { task } from 'hardhat/config';

export default task('export-abi')
  .setDescription(
    'Extract ABIs from compilation artifacts and write to a directory',
  )
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .setAction(import.meta.resolve('../actions/export_abi.js'))
  .build();
