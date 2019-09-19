pragma solidity ^0.5.8;

import {IERC20, IRToken} from './IRToken.sol';
import {IAllocationStrategy} from './IAllocationStrategy.sol';

contract Storage {
    struct GlobalStats {
        uint256 totalSupply;
        uint256 totalSavingsAmount;
    }

    struct AccountStats {
        uint256 cumulativeInterest;
    }

    struct Hat {
        address[] recipients;
        uint32[] proportions;
    }

    struct Account {
        uint256 hatID;
        uint256 rAmount;
        uint256 rInterest;
        mapping(address => uint256) lRecipients;
        uint256 lDebt;
        uint256 sInternalAmount;
        AccountStats stats;
    }

    /* WARNING: NEVER RE-ORDER VARIABLES! Always double-check that new variables are added APPEND-ONLY. Re-ordering variables can permanently BREAK your deployed proxy contract.*/
    address private _owner;
    uint256 private _guardCounter;
    uint256 public constant SELF_HAT_ID = uint256(int256(-1));
    uint32 public constant PROPORTION_BASE = 0xFFFFFFFF;
    string public name = 'Redeemable DAI (rDAI ethberlin)';
    string public symbol = 'rDAItest';
    uint256 public decimals = 18;
    uint256 public totalSupply;
    IAllocationStrategy private ias;
    IERC20 private token;
    uint256 private savingAssetOrignalAmount;
    uint256 private savingAssetConversionRate = 10**18;
    mapping(address => mapping(address => uint256)) private transferAllowances;
    Hat[] private hats;
    mapping(address => Account) private accounts;
}
