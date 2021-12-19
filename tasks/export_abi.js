const fs = require('fs');
const path = require('path');
const { HardhatPluginError } = require('hardhat/plugins');
const { Interface, FormatTypes } = require('@ethersproject/abi');

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
