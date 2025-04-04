import { abiFromTs } from './actions/utils.js';
import { Interface } from '@ethersproject/abi';
import deleteEmpty from 'delete-empty';
import fs from 'fs';
import path from 'path';

export async function clearAbiGroup(directory: string) {
  // TODO: enforce absolute path directory

  const files = (
    await fs.promises.readdir(directory, {
      recursive: true,
      withFileTypes: true,
    })
  )
    .filter((dirent) => dirent.isFile())
    .map((dirent) => path.resolve(dirent.parentPath, dirent.name));

  await Promise.all(
    files.map(async (file) => {
      if (path.extname(file) !== '.json') {
        // ABIs must be stored as JSON
        return;
      }

      const contents = (await fs.promises.readFile(file)).toString();

      try {
        // attempt to parse ABI from file contents
        new Interface(contents);
      } catch (e) {
        // file is not an ABI - do not delete
        return;
      }

      await fs.promises.rm(file);

      {
        // load the ts file from disk
        const tsWrappedFile = path.format({
          ...path.parse(file),
          base: '',
          ext: '.ts',
        });
        const tsContent = await fs.promises.readFile(tsWrappedFile, 'utf-8');

        // `spacing` is a setting, so to help with comparison we normalize to 2-spaces
        const normalizedABI = JSON.stringify(JSON.parse(contents), null, 2);
        // convert the TS file to what should be the same format at the normalized ABI
        const tsAsAbi = JSON.stringify(abiFromTs(tsContent), null, 2);

        if (normalizedABI === tsAsAbi) {
          // note: no need to check if the ts ABI is valid ABI
          // since we already checked `normalizedABI` is a valid ABI earlier
          // and if these two are equal, then transitively `tsAsAbi` is valid ABI as well
          await fs.promises.rm(
            tsWrappedFile,
            // do not error if the file doesn't exist
            { force: true },
          );
        }
      }
    }),
  );

  await deleteEmpty(directory);
}
