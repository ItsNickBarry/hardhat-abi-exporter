import pkg from '../package.json';
import { AbiExporterUserConfigEntry } from './types.js';
import { FormatTypes, Interface } from '@ethersproject/abi';
import deleteEmpty from 'delete-empty';
import fs from 'fs';
import { HardhatPluginError } from 'hardhat/plugins';
import { Abi } from 'hardhat/types/artifacts';
import { HookContext } from 'hardhat/types/hooks';
import JSON5 from 'json5';
import path from 'path';

export function abiToTs(json: string): string {
  return `export default ${json} as const;`;
}

/**
 * Extract an ABI from a typescript file
 * note: this function has to support the fact that linting tools might modify the Typescript file slightly
 */
export function abiFromTs(ts: string): any {
  // remove \n and \r characters to help remove the prefix & suffix
  const noSpacing = ts.trim().replace(/\n|\r/g, '');
  // remove the surrounding `export default` and `as const;`
  const inner = noSpacing.slice('export default '.length, -' as const;'.length);

  // we need to parse to take into account the fact that a linter may have changed some of the types
  // ex: { "key": "value" } can be changed into { key: "value" }
  // fortunately, JSON5 handles most of these common conversions
  const parsed = JSON5.parse(inner);
  return parsed;
}

export async function clearAbiGroup(directory: string) {
  if (!path.isAbsolute(directory)) {
    throw new HardhatPluginError(pkg.name, 'directory path must be absolute');
  }

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
  context: HookContext,
  config: Required<AbiExporterUserConfigEntry>,
) => {
  const outputDirectory = path.resolve(context.config.paths.root, config.path);

  if (outputDirectory === context.config.paths.root) {
    throw new HardhatPluginError(
      pkg.name,
      'resolved path must not be root directory',
    );
  }

  const outputData: {
    abi: string[] | readonly Abi[];
    destination: string;
  }[] = [];

  const fullNames = Array.from(
    await context.artifacts.getAllFullyQualifiedNames(),
  );

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
        await context.artifacts.readArtifact(fullName);

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
