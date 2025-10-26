# Hardhat ABI Exporter

Export Ethereum smart contract ABIs on compilation via Hardhat.

> Versions of this plugin prior to `3.0.0` were released as `hardhat-abi-exporter`, outside of the `@solidstate` namespace.

> Versions of this plugin prior to `2.0.0` were released as `buidler-abi-exporter`.

## Installation

```bash
npm install --save-dev @solidstate/hardhat-abi-exporter
# or
pnpm add -D @solidstate/hardhat-abi-exporter
```

## Usage

Load plugin in Hardhat config:

```javascript
import hardhatAbiExporter from '@solidstate/hardhat-abi-exporter';

const config: HardhatUserConfig = {
  plugins: [
    hardhatAbiExporter,
  ],
  abiExporter: {
    ... // see table for configuration options
  },
};
```

Add configuration under the `abiExporter` key:

| option         | description                                                                                                                                                                | default      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| `path`         | path to ABI export directory (relative to Hardhat root)                                                                                                                    | `'./abi'`    |
| `runOnCompile` | whether to automatically export ABIs during compilation                                                                                                                    | `false`      |
| `clear`        | whether to delete old ABI files in `path` on compilation and on clean                                                                                                      | `false`      |
| `flat`         | whether to flatten output directory (may cause name collisions)                                                                                                            | `false`      |
| `only`         | `Array` of `String` matchers used to select included contracts, defaults to all contracts if `length` is 0                                                                 | `[]`         |
| `except`       | `Array` of `String` matchers used to exclude contracts                                                                                                                     | `[]`         |
| `spacing`      | number of spaces per indentation level of formatted output                                                                                                                 | `2`          |
| `pretty`       | whether to use interface-style formatting of output for better readability                                                                                                 | `false`      |
| `filter`       | `Function` with signature `(abiElement: any, index: number, abi: any, sourceName: string, contractName: string) => boolean` used to filter elements from each exported ABI | `() => true` |
| `format`       | format type (`'minimal'`, `'full'`, `'json'`, `'typescript'`)                                                                                                              | `'json'`     |
| `rename`       | `Function` with signature `(sourceName: string, contractName: string) => string` used to rename an exported ABI (incompatible with `flat` option)                          | `undefined`  |

Note that the configuration may be formatted as either a single `Object`, or an `Array` of objects specifying multiple outputs.

```javascript
abiExporter: {
  path: './data/abi',
  runOnCompile: true,
  clear: true,
  flat: true,
  only: [':ERC20$'],
  spacing: 2,
  pretty: true,
  format: "minimal",
}

// or

abiExporter: [
  {
    path: './abi/pretty',
    pretty: true,
  },
  {
    path: './abi/ugly',
    pretty: false,
  },
]

// or

abiExporter: [
  {
    path: './abi/json',
    format: "json",
  },
  {
    path: './abi/minimal',
    format: "minimal",
  },
  {
    path: './abi/full',
    format: "full",
  },
]
```

The included Hardhat tasks may be run manually:

```bash
npx hardhat abi export
npx hardhat abi clear
# or
pnpm hardhat abi export
pnpm hardhat abi clear
```

By default, the hardhat `compile` task is run before exporting ABIs. This behavior can be disabled with the `--no-compile` flag:

```bash
npx hardhat abi export --no-compile
# or
pnpm hardhat abi export --no-compile
```

The `path` directory will be created if it does not exist.

The `clear` option is set to `false` by default because it represents a destructive action, but should be set to `true` in most cases.

ABIs files are saved in the format `[CONTRACT_NAME].json`.

## Development

Install dependencies via pnpm:

```bash
pnpm install
```

Setup Husky to format code on commit:

```bash
pnpm prepare
```
