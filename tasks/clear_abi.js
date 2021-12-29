const fs = require('fs');
const path = require('path');
const deleteEmpty = require('delete-empty');
const { Interface } = require('@ethersproject/abi');

const readdirRecursive = function(dirPath, output = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    file = path.join(dirPath, file);

    if (fs.statSync(file).isDirectory()) {
      output = readdirRecursive(file, output);
    } else {
      output.push(file);
    }
  });

  return output;
};

task('clear-abi', async function (args, hre) {
  const config = hre.config.abiExporter;

  await hre.run('clear-abi-group', { path: config.path });
});

subtask(
  'clear-abi-group'
).addParam(
  'path'
).setAction(async function (args, hre) {
  const outputDirectory = path.resolve(hre.config.paths.root, args.path);

  if (!fs.existsSync(outputDirectory)) {
    return;
  }

  const files = readdirRecursive(outputDirectory).filter(f => path.extname(f) === '.json');

  await Promise.all(files.map(async function (file) {
    try {
      const contents = await fs.promises.readFile(file);
      new Interface(contents.toString());
      await fs.promises.rm(file);
    } catch (e) {
      // file is not an ABI; do nothing
    }
  }));

  await deleteEmpty(outputDirectory);
});
