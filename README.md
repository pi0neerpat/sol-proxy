# Solidity Proxy Creator (sol-proxy)

![npm version](https://img.shields.io/npm/v/sol-proxy.svg)

A tool (currently in alpha) for turning any Solidity contract into a proxy contract, per [EIP 1822](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1822.md).

> This tool wouldn't have been possible without [Frederico Bond](https://github.com/federicobond), creator of [Solidity Parser ANTLR](https://github.com/federicobond/solidity-parser-antlr) and [Solidity Inspector (soli)](https://github.com/federicobond/soli). Fun fact: [many other projects](https://www.npmjs.com/browse/depended/solidity-parser-antlr) rely on Solidity Parser, including Solidity-coverage, OpenZeppelin CLI, Prettier Plugin for Solidity, and many more smart contract visualization/inspection utilities... that's pretty neat!

## Getting Started

Install it via npm:

```shell
npm install -g sol-proxy
```

## Usage

### 1. Create `Storage.sol`

The `create` command generates `Storage.sol` which contains all the contract variables.

```shell
sol-proxy create contracts/MyContract.sol
```

>note: if you've already run this command, you will need to remove the `Storage.sol` import and the Storage inheritance in your contract. You will add this back at the end.

### 2. Variable Ordering

:warning: Ensure the variables have not been re-ordered from a previously deployed version of the contract. Failure to maintain variable ordering can permanently corrupt your deployed contract.

Simply adjust the variables until they are in the correct order, with any **new variables added at the end**.

:eyes: Get a few friends to double-check this.

### 3. Cleanup

1. Remove duplicate `pragma` declarations.
2. Add necessary import statements.
3. All structs should be removed from `Storage.sol`. If any of these structs are needed in `Storage.sol`, they must also be removed from their original contract and placed into a separate `Structs.sol`. If needed, import `Structs.sol` into `Storage.sol` and other dependent contracts.
4. Add an import and inheritance for `Storage.sol` and `Proxiable.sol` to your contract.

```solidity
pragma solidity ^0.5.8;

import {Storage} from "./Storage.sol";
import {Proxiable} from "./Proxiable.sol";

contract MyToken is Storage, Proxiable {
  //...
```

Refer to [EIP 1822](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1822.md) to get a better understanding of using this Proxy.

## License

GPL-3.0
