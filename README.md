# Hardhat ABI Exporter

Export Ethereum smart contract ABIs on compilation via Hardhat.

> Versions of this plugin prior to `2.0.0` were released as `buidler-abi-exporter`.

## Installation

```bash
yarn add --dev hardhat-abi-exporter
```

## Usage

Load plugin in Hardhat config:

```javascript
require('hardhat-abi-exporter');
```

Add configuration under the `abiExporter` key:

| option | description | default |
|-|-|-|
| `path` | path to ABI export directory (relative to Hardhat root) | `'./abi'` |
| `runOnCompile` | whether to automatically export ABIs during compilation | `false` |
| `clear` | whether to delete old ABI files in `path` on compilation | `false` |
| `flat` | whether to flatten output directory (may cause name collisions) | `false` |
| `only` | `Array` of `String` matchers used to select included contracts, defaults to all contracts if `length` is 0 | `[]` |
| `except` | `Array` of `String` matchers used to exclude contracts | `[]` |
| `spacing` | number of spaces per indentation level of formatted output | `2` |
| `pretty` | whether to use interface-style formatting of output for better readability | `false` |
| `filter` | `Function` with signature `(abiElement: any, index: number, abi: any, fullyQualifiedName: string) => boolean` used to filter elements from each exported ABI | `() => true` |

```javascript
abiExporter: {
  path: './data/abi',
  runOnCompile: true,
  clear: true,
  flat: true,
  only: [':ERC20$'],
  spacing: 2,
  pretty: true,
}
```

The included Hardhat tasks may be run manually:

```bash
yarn run hardhat export-abi
yarn run hardhat clear-abi
```

By default, the hardhat `compile` task is run before exporting ABIs.  This behavior can be disabled with the `--no-compile` flag:

```bash
yarn run hardhat export-abi --no-compile
```


The `path` directory will be created if it does not exist.

The `clear` option is set to `false` by default because it represents a destructive action, but should be set to `true` in most cases.

ABIs files are saved in the format `[CONTRACT_NAME].json`.
