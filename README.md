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
| `path` | path to ABI export directory (relative to Hardhat root) | `'./abi'`
| `clear` | whether to delete old files in `path` on  | `false` |
| `flat` | whether to flatten output directory (may cause name collisions) | `false` |
| `only` | `Array` of `String` matchers used to select included contracts, defaults to all contracts if `length` is 0 | `[]` |
| `except` | `Array` of `String` matchers used to exclude contracts | `[]` |

```javascript
abiExporter: {
  path: './data/abi',
  clear: true,
  flat: true,
  only: [':ERC20$'],
}
```

The `path` directory will be created if it does not exist.

The `clear` option is set to `false` by default because it represents a destructive action, but should be set to `true` in most cases.

ABIs files are saved in the format `[CONTRACT_NAME].json`.
