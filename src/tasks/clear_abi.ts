import { Interface } from '@ethersproject/abi';
import deleteEmpty from 'delete-empty';
import fs from 'fs';
import { task, subtask, types } from 'hardhat/config';
import path from 'path';

const readdirRecursive = (dirPath: string, output: string[] = []) => {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    file = path.join(dirPath, file);

    if (fs.statSync(file).isDirectory()) {
      output = readdirRecursive(file, output);
    } else {
      output.push(file);
    }
  });

  return output;
};

task('clear-abi', async (args, hre) => {
  const configs = hre.config.abiExporter;

  await Promise.all(
    configs.map((abiExporterConfig) => {
      return hre.run('clear-abi-group', { path: abiExporterConfig.path });
    }),
  );
});

subtask('clear-abi-group')
  .addParam('path', 'path to look for ABIs', undefined, types.string)
  .setAction(async (args, hre) => {
    const outputDirectory = path.resolve(hre.config.paths.root, args.path);

    if (!fs.existsSync(outputDirectory)) {
      return;
    }

    const files = readdirRecursive(outputDirectory);

    await Promise.all(
      files.map(async (file) => {
        if (path.extname(file) !== '.json') {
          // ABIs must be stored as JSON
          return;
        }

        const contents = await fs.promises.readFile(file);

        try {
          // attempt to parse ABI from file contents
          new Interface(contents.toString());
        } catch (e) {
          // file is not an ABI - do not delete
          return;
        }

        await fs.promises.rm(file);
      }),
    );

    await deleteEmpty(outputDirectory);
  });
