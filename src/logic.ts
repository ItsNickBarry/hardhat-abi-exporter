import pkg from '../package.json';
import { abiFromTs, abiToTs } from './actions/utils.js';
import { AbiExporterUserConfigEntry } from './types.js';
import { FormatTypes, Interface } from '@ethersproject/abi';
import deleteEmpty from 'delete-empty';
import fs from 'fs';
import { HardhatPluginError } from 'hardhat/plugins';
import { Abi } from 'hardhat/types/artifacts';
import { HardhatRuntimeEnvironment } from 'hardhat/types/hre';
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

export const exportAbiGroup = async (
  hre: HardhatRuntimeEnvironment,
  config: Required<AbiExporterUserConfigEntry>,
) => {
  const outputDirectory = path.resolve(hre.config.paths.root, config.path);

  if (outputDirectory === hre.config.paths.root) {
    throw new HardhatPluginError(
      pkg.name,
      'resolved path must not be root directory',
    );
  }

  const outputData: {
    abi: string[] | readonly Abi[];
    destination: string;
  }[] = [];

  const fullNames = Array.from(await hre.artifacts.getAllFullyQualifiedNames());

  await Promise.all(
    fullNames.map(async (fullName) => {
      if (config.only.length && !config.only.some((m) => fullName.match(m))) {
        return;
      }
      if (
        config.except.length &&
        config.except.some((m) => fullName.match(m))
      ) {
        return;
      }

      let { abi, sourceName, contractName } =
        await hre.artifacts.readArtifact(fullName);

      if (!abi.length) return;

      abi = abi.filter((element, index, array) =>
        config.filter(element, index, array, fullName),
      );

      if (config.format == 'minimal') {
        abi = [new Interface(abi).format(FormatTypes.minimal)].flat();
      } else if (config.format == 'fullName') {
        abi = [new Interface(abi).format(FormatTypes.fullName)].flat();
      } else if (config.format != 'json') {
        throw new HardhatPluginError(
          pkg.name,
          `Unknown format: ${config.format}`,
        );
      }

      const destination = path.resolve(
        outputDirectory,
        config.rename(sourceName, contractName),
      );

      outputData.push({ abi, destination });
    }),
  );

  outputData.reduce(
    (
      acc: { [destination: string]: string[] | readonly Abi[] },
      { abi, destination },
    ) => {
      const contents = acc[destination];

      if (contents && JSON.stringify(contents) !== JSON.stringify(abi)) {
        throw new HardhatPluginError(
          pkg.name,
          `multiple distinct contracts share same output destination: ${destination}`,
        );
      }

      acc[destination] = abi;
      return acc;
    },
    {},
  );

  if (config.clear) {
    await clearAbiGroup(outputDirectory);
  }

  await Promise.all(
    outputData.map(async ({ abi, destination }) => {
      await fs.promises.mkdir(path.dirname(destination), { recursive: true });
      const outputJson = JSON.stringify(abi, null, config.spacing);
      await fs.promises.writeFile(`${destination}.json`, `${outputJson}\n`, {
        flag: 'w',
      });

      if (config.tsWrapper) {
        await fs.promises.writeFile(`${destination}.ts`, abiToTs(outputJson), {
          flag: 'w',
        });
      }
    }),
  );
};
