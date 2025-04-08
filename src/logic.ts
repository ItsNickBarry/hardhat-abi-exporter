import pkg from '../package.json';
import { AbiExporterConfigEntry } from './types.js';
import { FormatTypes, Interface } from '@ethersproject/abi';
import deleteEmpty from 'delete-empty';
import fs from 'fs';
import { HardhatPluginError } from 'hardhat/plugins';
import { HookContext } from 'hardhat/types/hooks';
import path from 'path';

const TS_TAG = `// this file was automatically generated by ${pkg.name} - do not modify`;

export const clearAbi = async (
  context: HookContext,
  configEntries: AbiExporterConfigEntry[],
) => {
  const entries = configEntries.filter((entry) => entry.clear);

  await Promise.all(entries.map((entry) => clearAbiGroup(context, entry)));
};

export const exportAbi = async (
  context: HookContext,
  configEntries: AbiExporterConfigEntry[],
) => {
  await clearAbi(context, configEntries);

  await Promise.all(
    configEntries.map((entry) => exportAbiGroup(context, entry)),
  );
};

const clearAbiGroup = async (
  context: HookContext,
  config: AbiExporterConfigEntry,
) => {
  const outputDirectory = path.resolve(context.config.paths.root, config.path);

  if (!fs.existsSync(outputDirectory)) {
    return;
  }

  const files = (
    await fs.promises.readdir(outputDirectory, {
      recursive: true,
      withFileTypes: true,
    })
  )
    .filter((dirent) => dirent.isFile())
    .map((dirent) => path.resolve(dirent.parentPath, dirent.name));

  await Promise.all(
    files.map(async (file) => {
      const contents = await fs.promises.readFile(file, 'utf-8');

      if (path.extname(file) === '.json') {
        try {
          // attempt to parse ABI from file contents
          new Interface(contents);
        } catch (e) {
          // file is not an ABI - do not delete
          return;
        }
      } else if (path.extname(file) === '.ts') {
        if (!contents.includes(TS_TAG)) {
          // file was not generated by plugin - do not delete
          return;
        }
      } else {
        // ABIs must be stored as JSON or TS
        return;
      }

      await fs.promises.rm(file);
    }),
  );

  await deleteEmpty(outputDirectory);
};

export const exportAbiGroup = async (
  context: HookContext,
  config: AbiExporterConfigEntry,
) => {
  const outputDirectory = path.resolve(context.config.paths.root, config.path);

  if (outputDirectory === context.config.paths.root) {
    throw new HardhatPluginError(
      pkg.name,
      'resolved path must not be root directory',
    );
  }

  const outputData: { destination: string; contents: string }[] = [];

  const fullNames = Array.from(
    await context.artifacts.getAllFullyQualifiedNames(),
  );

  await Promise.all(
    fullNames.map(async (fullName) => {
      if (config.only.length && !config.only.some((m) => fullName.match(m)))
        return;
      if (config.except.length && config.except.some((m) => fullName.match(m)))
        return;

      let { abi, sourceName, contractName } =
        await context.artifacts.readArtifact(fullName);

      if (!abi.length) return;

      abi = abi.filter((element, index, array) =>
        config.filter(element, index, array, fullName),
      );

      // format ABI using ethers presets
      const formatType = FormatTypes[config.format] ?? 'json';
      abi = [new Interface(abi).format(formatType)].flat();

      let contents = JSON.stringify(abi, null, config.spacing);

      if (config.format === 'typescript') {
        contents = `${TS_TAG}\nexport default ${contents} as const;\n`;
      }

      if (!['json', 'minimal', 'full', 'typescript'].includes(config.format)) {
        throw new HardhatPluginError(
          pkg.name,
          `Unknown format: ${config.format}`,
        );
      }

      const extension = config.format === 'typescript' ? '.ts' : '.json';
      const destination =
        path.resolve(outputDirectory, config.rename(sourceName, contractName)) +
        extension;

      outputData.push({ destination, contents });
    }),
  );

  outputData.reduce(
    (acc: { [destination: string]: string }, { destination, contents }) => {
      const previousContents = acc[destination];

      if (previousContents && previousContents !== contents) {
        throw new HardhatPluginError(
          pkg.name,
          `multiple distinct contracts share same output destination: ${destination}`,
        );
      }

      acc[destination] = contents;
      return acc;
    },
    {},
  );

  await Promise.all(
    outputData.map(async ({ destination, contents }) => {
      await fs.promises.mkdir(path.dirname(destination), { recursive: true });
      await fs.promises.writeFile(destination, contents, { flag: 'w' });
    }),
  );
};
