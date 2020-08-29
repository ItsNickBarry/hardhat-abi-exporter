const {
  TASK_COMPILE,
} = require('@nomiclabs/buidler/builtin-tasks/task-names');

const fs = require('fs');

const CONFIG = {
  path: './abi',
  only: [],
  except: [],
  clear: false,
};

task(TASK_COMPILE, async function (args, bre, runSuper) {
  let config = Object.assign({}, CONFIG, bre.config.abiExporter);

  await runSuper();

  let path = `${ bre.config.paths.root }/${ config.path }`;

  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }

  if (config.clear) {
    let files = fs.readdirSync(path);

    for (let file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(`${ path }/${ file }`);
      }
    }
  }

  let artifacts = fs.readdirSync(bre.config.paths.artifacts).filter(a => a.endsWith('.json')).map(a => a.replace('.json', ''));

  let contracts = new Set(config.only.length ? config.only : artifacts);

  for (let contract of config.except) {
    contracts.delete(contract);
  }

  for (let contract of contracts) {
    let json;

    try {
      json = JSON.parse(fs.readFileSync(`${ bre.config.paths.artifacts }/${ contract }.json`, 'utf8'));
    } catch (e) {
      console.log(`Artifact not found for contract: ${ contract }`);
      continue;
    }

    fs.writeFileSync(`${ path }/${ contract }.json`, `${ JSON.stringify(json.abi) }\n`, { flag: 'w' });
  }
});
