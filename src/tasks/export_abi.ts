import pkg from '../../package.json' with { type: 'json' };
import { FormatTypes, Interface } from '@ethersproject/abi';
import { task } from 'hardhat/config';
import { HardhatPluginError } from 'hardhat/plugins';
import { ArgumentType } from 'hardhat/types/arguments';
import type { Abi } from 'hardhat/types/artifacts';
import fs from 'node:fs';
import path from 'node:path';

export const exportAbiTask = task('export-abi')
  .addFlag({
    name: 'noCompile',
    description: "Don't compile before running this task",
  })
  .setAction(import.meta.resolve('../actions/export/all.js'))
  .build();

export const exportAbiGroupTask = task(['export-abi', 'group'])
  .addPositionalArgument({
    name: 'path',
    description: 'path to look for ABIs',
    type: ArgumentType.STRING,
    defaultValue: undefined,
  })
  .setAction(import.meta.resolve('../actions/export/group.js'))
  .build();
