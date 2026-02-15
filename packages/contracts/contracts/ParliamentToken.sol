// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ParliamentToken is ERC20, Ownable {
    // 1. Initial Supply: 1 Million PARL
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;

    // Staking state (Compatible with DAOGovernance)
    mapping(address => uint256) public stakedBalance;
    mapping(uint256 => mapping(address => uint256)) public debateStakes;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event DebateStaked(address indexed user, uint256 debateId, uint256 amount);
    event RewardDistributed(address indexed user, uint256 amount);

    constructor() ERC20("Parliament Token", "PARL") Ownable(msg.sender) {
        // Mint all tokens to the deployer (Treasury) initially
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // 2. Airdrop Function: Distribute to agents in batch
    function genesisDrop(address[] calldata recipients, uint256 amount) external onlyOwner {
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amount);
        }
    }

    // 3. Reward Function: Mint new tokens for good behavior (optional)
    function mintReward(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // --- Legacy / Staking Support ---

    /**
     * @notice Stake tokens to participate in governance
     */
    function stake(uint256 amount) external {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _transfer(msg.sender, address(this), amount);
        stakedBalance[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Unstake tokens
     */
    function unstake(uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked");
        stakedBalance[msg.sender] -= amount;
        _transfer(address(this), msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    /**
     * @notice Stake on a debate outcome (prediction market)
     */
    function stakeOnDebate(uint256 debateId, uint256 amount) external {
        require(stakedBalance[msg.sender] >= amount, "Insufficient staked");
        debateStakes[debateId][msg.sender] += amount;
        emit DebateStaked(msg.sender, debateId, amount);
    }
}
