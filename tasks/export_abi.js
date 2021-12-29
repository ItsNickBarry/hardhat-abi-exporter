const fs = require('fs');
const path = require('path');
const { HardhatPluginError } = require('hardhat/plugins');
const { Interface, FormatTypes } = require('@ethersproject/abi');

task('export-abi', async function (args, hre) {
  const config = hre.config.abiExporter;

  const outputDirectory = path.resolve(hre.config.paths.root, config.path);

  if (outputDirectory === hre.config.paths.root) {
    throw new HardhatPluginError('resolved path must not be root directory');
  }

  const outputData = [];

  const fullNames = await hre.artifacts.getAllFullyQualifiedNames();

  await Promise.all(fullNames.map(async function (fullName) {
    if (config.only.length && !config.only.some(m => fullName.match(m))) return;
    if (config.except.length && config.except.some(m => fullName.match(m))) return;

    let { abi, sourceName, contractName } = await hre.artifacts.readArtifact(fullName);

    if (!abi.length) return;

    if (config.pretty) {
      abi = new Interface(abi).format(FormatTypes.minimal);
    }

    const destination = path.resolve(
      outputDirectory,
      config.flat ? '' : sourceName,
      contractName
    ) + '.json';

    outputData.push({ abi, destination });
  }));

  outputData.reduce(function (acc, { destination }) {
    if (acc.has(destination)) {
      throw new HardhatPluginError(`duplicate output destination: ${ destination }`);
    }

    acc.add(destination);
    return acc;
  }, new Set());

  if (config.clear) {
    await hre.run('clear-abi');
  }

  await Promise.all(outputData.map(async function ({ abi, destination }) {
    await fs.promises.mkdir(path.dirname(destination), { recursive: true });
    await fs.promises.writeFile(destination, `${JSON.stringify(abi, null, config.spacing)}\n`, { flag: 'w' });
  }));
});