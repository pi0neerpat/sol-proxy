# Solidity Proxy Creator (sol-proxy)

![npm version](https://img.shields.io/npm/v/sol-proxy.svg)

A tool (currently in alpha) for turning any Solidity contract into a proxy contract, per [EIP 1822](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1822.md).

> This tool wouldn't have been possible without [Frederico Bond](https://github.com/federicobond), creator of [Solidity Parser ANTLR](https://github.com/federicobond/solidity-parser-antlr) and [Solidity Inspector (soli)](https://github.com/federicobond/soli). Fun fact: [many other projects](https://www.npmjs.com/browse/depended/solidity-parser-antlr) rely on Solidity Parser, including Solidity-coverage, OpenZeppelin CLI, Prettier Plugin for Solidity, and many more smart contract visualization/inspection utilities... that's pretty neat!

## Getting Started

Install it via npm:

```shell
npm install -g sol-proxy
```

## Command List

### create

The `create` command turns a contract into a proxy.

```shell
sol-proxy create MyContract.sol
```

<img src="https://" width="336" height="236">

### update

The `update` command searches for new variables and adds them properly (e.g. append-only) to the storage contract.

```shell
sol-proxy update MyContract.sol
```

## License

GPL-3.0
