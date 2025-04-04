import { name as pluginName } from '../../package.json';
import { AbiExporterConfigEntry } from '../index';
import { Interface, FormatTypes } from '@ethersproject/abi';
import fs from 'fs';
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names';
import { task, subtask, types } from 'hardhat/config';
import { HardhatPluginError } from 'hardhat/plugins';
import path from 'path';

task('export-abi')
  .addFlag('noCompile', "Don't compile before running this task")
  .setAction(async (args, hre) => {
    if (!args.noCompile) {
      await hre.run(TASK_COMPILE, { noExportAbi: true });
    }

    const configs = hre.config.abiExporter;

    await Promise.all(
      configs.map((abiGroupConfig) => {
        return hre.run('export-abi-group', { abiGroupConfig });
      }),
    );
  });

subtask('export-abi-group')
  .addParam(
    'abiGroupConfig',
    'a single abi-exporter config object',
    undefined,
    types.any,
  )
  .setAction(async (args, hre) => {
    const { abiGroupConfig: config } = args as {
      abiGroupConfig: AbiExporterConfigEntry;
    };

    const outputDirectory = path.resolve(hre.config.paths.root, config.path);

    if (outputDirectory === hre.config.paths.root) {
      throw new HardhatPluginError(
        pluginName,
        'resolved path must not be root directory',
      );
    }

    const outputData: { destination: string; contents: string }[] = [];

    const fullNames = await hre.artifacts.getAllFullyQualifiedNames();

    await Promise.all(
      fullNames.map(async (fullName) => {
        if (config.only.length && !config.only.some((m) => fullName.match(m)))
          return;
        if (
          config.except.length &&
          config.except.some((m) => fullName.match(m))
        )
          return;

        let { abi, sourceName, contractName } =
          await hre.artifacts.readArtifact(fullName);

        if (!abi.length) return;

        abi = abi.filter((element, index, array) =>
          config.filter(element, index, array, fullName),
        );

        let contents: string;

        if (config.format === 'json') {
          contents = JSON.stringify(abi, null, config.spacing);
        } else if (config.format == 'minimal') {
          abi = [new Interface(abi).format(FormatTypes.minimal)].flat();
          contents = JSON.stringify(abi, null, config.spacing);
        } else if (config.format == 'fullName') {
          abi = [new Interface(abi).format(FormatTypes.fullName)].flat();
          contents = JSON.stringify(abi, null, config.spacing);
        } else if (config.format === 'typescript') {
          contents = `export default ${JSON.stringify(abi, null, config.spacing)} as const;`;
        } else {
          throw new HardhatPluginError(
            pluginName,
            `Unknown format: ${config.format}`,
          );
        }

        const extension = config.format === 'typescript' ? '.ts' : '.json';
        const destination =
          path.resolve(
            outputDirectory,
            config.rename(sourceName, contractName),
          ) + extension;

        outputData.push({ destination, contents });
      }),
    );

    outputData.reduce(
      (acc: { [destination: string]: string }, { destination, contents }) => {
        const previousContents = acc[destination];

        if (previousContents === contents) {
          throw new HardhatPluginError(
            pluginName,
            `multiple distinct contracts share same output destination: ${destination}`,
          );
        }

        acc[destination] = contents;
        return acc;
      },
      {},
    );

    if (config.clear) {
      await hre.run('clear-abi-group', { path: config.path });
    }

    await Promise.all(
      outputData.map(async ({ destination, contents }) => {
        await fs.promises.mkdir(path.dirname(destination), { recursive: true });
        await fs.promises.writeFile(destination, contents, { flag: 'w' });
      }),
    );
  });
