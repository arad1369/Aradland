// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title Arad Land Token (ARAD)
/// @notice Reward token for Arad Land staking. The whole supply is minted once
///         to the deployer, who then sends a reward budget to the staking contract.
contract AradToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Arad Land Token", "ARAD") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
}
