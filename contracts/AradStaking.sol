// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Arad Land Staking
/// @notice Users stake the native coin (QMS) and earn ARAD tokens every second.
///         Rewards accumulate on-chain per user ("your account on the site");
///         the user pays only the normal network fee when calling claim().
///         Rewards are paid from the ARAD balance held by this contract, so the
///         owner of the token must transfer a reward budget here after deploying.
contract AradStaking is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// ARAD token paid out as reward.
    IERC20 public immutable rewardToken;
    /// Reward (in ARAD wei) earned per 1 QMS staked per day. 10e18 = 10 ARAD/day per QMS.
    uint256 public immutable rewardPerQmsPerDay;

    uint256 public totalStaked;
    uint256 public totalRewardsPaid;

    struct Position {
        uint256 amount;     // staked QMS (wei)
        uint256 lastUpdate; // last time `pending` was brought up to date
        uint256 pending;    // accrued, not yet claimed ARAD (wei)
    }

    mapping(address => Position) public positions;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event Claimed(address indexed user, uint256 reward);

    constructor(address _rewardToken, uint256 _rewardPerQmsPerDay) {
        require(_rewardToken != address(0), "token=0");
        rewardToken = IERC20(_rewardToken);
        rewardPerQmsPerDay = _rewardPerQmsPerDay;
    }

    // ---------- views ----------

    function pendingReward(address user) public view returns (uint256) {
        Position storage p = positions[user];
        uint256 earned = 0;
        if (p.amount > 0) {
            earned = (p.amount * rewardPerQmsPerDay * (block.timestamp - p.lastUpdate)) / (1 ether * 1 days);
        }
        return p.pending + earned;
    }

    // ---------- actions ----------

    function stake() external payable nonReentrant {
        require(msg.value > 0, "amount=0");
        _accrue(msg.sender);
        positions[msg.sender].amount += msg.value;
        totalStaked += msg.value;
        emit Staked(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external nonReentrant {
        Position storage p = positions[msg.sender];
        require(amount > 0 && amount <= p.amount, "bad amount");
        _accrue(msg.sender);
        p.amount -= amount;
        totalStaked -= amount;
        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "QMS transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function claim() external nonReentrant {
        _accrue(msg.sender);
        Position storage p = positions[msg.sender];
        uint256 reward = p.pending;
        require(reward > 0, "nothing to claim");
        require(rewardToken.balanceOf(address(this)) >= reward, "reward pool empty");
        p.pending = 0;
        totalRewardsPaid += reward;
        rewardToken.safeTransfer(msg.sender, reward);
        emit Claimed(msg.sender, reward);
    }

    // ---------- internal ----------

    function _accrue(address user) internal {
        Position storage p = positions[user];
        if (p.amount > 0) {
            p.pending += (p.amount * rewardPerQmsPerDay * (block.timestamp - p.lastUpdate)) / (1 ether * 1 days);
        }
        p.lastUpdate = block.timestamp;
    }
}
