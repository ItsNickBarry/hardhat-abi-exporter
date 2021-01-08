const fs = require('fs');
const path = require('path');
const { extendConfig } = require('hardhat/config');

const { HardhatPluginError } = require('hardhat/plugins');

const {
  TASK_COMPILE,
} = require('hardhat/builtin-tasks/task-names');

extendConfig(function (config, userConfig) {
  config.abiExporter = Object.assign(
    {
      path: './abi',
      clear: false,
      flat: false,
      only: [],
      except: [],
    },
    userConfig.abiExporter
  );
});

task(TASK_COMPILE, async function (args, hre, runSuper) {
  let config = hre.config.abiExporter;

  await runSuper();

  let outputDirectory = path.resolve(hre.config.paths.root, config.path);

  if (!outputDirectory.startsWith(hre.config.paths.root)) {
    throw new HardhatPluginError('resolved path must be inside of project directory');
  }

  if(outputDirectory === hre.config.paths.root) {
    throw new HardhatPluginError('resolved path must not be root directory');
  }

  if (config.clear) {
    fs.rmdirSync(outputDirectory, { recursive: true });
  }

  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  let artifactPaths = await hre.artifacts.getArtifactPaths();

  let nameOf = artifactPath => path.basename(artifactPath).replace('.json', '');

  if (config.only.length) {
    let only = new Set(config.only);
    artifactPaths = artifactPaths.filter(artifactPath => only.has(nameOf(artifactPath)));
  }

  if (config.except.length) {
    let except = new Set(config.except);
    artifactPaths = artifactPaths.filter(artifactPath => !except.has(nameOf(artifactPath)));
  }

  for (let artifactPath of artifactPaths) {
    try {
      let { abi } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

      if (!abi.length) continue;

      let destination;

      if (config.flat) {
        destination = `${ nameOf(artifactPath) }.json`;
      } else {
        destination = `${ artifactPath.replace(hre.config.paths.artifacts, '') }`;
      }

      destination = path.resolve(`${ outputDirectory }/${ destination }`);

      if (!fs.existsSync(path.dirname(destination))) {
        fs.mkdirSync(path.dirname(destination), { recursive: true });
      }

      fs.writeFileSync(destination, `${ JSON.stringify(abi, null, 2) }\n`, { flag: 'w' });
    } catch (e) {
      console.log(`Artifact not found for contract: ${ nameOf(artifactPath) }`);
    }
  }
});
