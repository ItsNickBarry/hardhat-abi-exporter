const fs = require('fs');
const path = require('path');
const deleteEmpty = require('delete-empty');
const { extendConfig } = require('hardhat/config');
const { HardhatPluginError } = require('hardhat/plugins');
const { Interface, FormatTypes } = require('@ethersproject/abi');

const {
  TASK_COMPILE,
} = require('hardhat/builtin-tasks/task-names');

extendConfig(function (config, userConfig) {
  config.abiExporter = Object.assign(
    {
      path: './abi',
      runOnCompile: false,
      clear: false,
      flat: false,
      only: [],
      except: [],
      spacing: 2,
      pretty: false,
    },
    userConfig.abiExporter
  );
});

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

task('export-abi', async function (args, hre) {
  const config = hre.config.abiExporter;

  if (config.clear) {
    await hre.run('clear-abi');
  }

  const outputDirectory = path.resolve(hre.config.paths.root, config.path);

  if (outputDirectory === hre.config.paths.root) {
    throw new HardhatPluginError('resolved path must not be root directory');
  }

  for (let fullName of await hre.artifacts.getAllFullyQualifiedNames()) {
    if (config.only.length && !config.only.some(m => fullName.match(m))) continue;
    if (config.except.length && config.except.some(m => fullName.match(m))) continue;

    let { abi, sourceName, contractName } = await hre.artifacts.readArtifact(fullName);

    if (!abi.length) continue;

    const destination = path.resolve(
      outputDirectory,
      config.flat ? '' : sourceName,
      contractName
    ) + '.json';

    if (!fs.existsSync(path.dirname(destination))) {
      fs.mkdirSync(path.dirname(destination), { recursive: true });
    }

    if (config.pretty) {
      abi = new Interface(abi).format(FormatTypes.minimal);
    }

    fs.writeFileSync(destination, `${JSON.stringify(abi, null, config.spacing)}\n`, { flag: 'w' });
  }
});

task('clear-abi', async function (args, hre) {
  const config = hre.config.abiExporter;

  const outputDirectory = path.resolve(hre.config.paths.root, config.path);

  if (!fs.existsSync(outputDirectory)) {
    return;
  }

  const files = readdirRecursive(outputDirectory).filter(f => path.extname(f) === '.json');

  for (let file of files) {
    try {
      const filepath = path.resolve(outputDirectory, file);
      const contents = fs.readFileSync(filepath).toString();
      new Interface(contents);
      fs.rmSync(filepath);
    } catch (e) {
      continue;
    }
  }

  await deleteEmpty(outputDirectory);
});

task(TASK_COMPILE, async function (args, hre, runSuper) {
  await runSuper();

  if (hre.config.abiExporter.runOnCompile) {
    await hre.run('export-abi');
  }
});
