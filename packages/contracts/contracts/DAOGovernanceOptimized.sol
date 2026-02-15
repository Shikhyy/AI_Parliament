// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ParliamentToken.sol";

/**
 * @title DAOGovernanceOptimized
 * @notice Gas-optimized governance with quadratic voting and time-locks
 */
contract DAOGovernanceOptimized {
    
    ParliamentToken public token;
    
    enum ProposalType {
        AddAgent,
        RemoveAgent,
        ChangeRules,
        TreasuryAllocation
    }
    
    enum ProposalCategory {
        Critical,    // 80% majority
        Standard,    // 51% majority
        Minor        // 33% majority
    }
    
    struct Proposal {
        uint128 votesFor;
        uint128 votesAgainst;
        uint64 deadline;
        uint32 proposalId;
        ProposalType proposalType;
        ProposalCategory category;
        bool executed;
        bool passed;
    }
    
    mapping(uint32 => Proposal) public proposals;
    mapping(uint32 => mapping(address => uint128)) public votes; // Quadratic votes
    mapping(uint32 => string) public proposalDetails; // Stored separately to save gas
    uint32 public proposalCounter;
    
    uint64 public constant VOTING_PERIOD = 7 days;
    uint64 public constant TIMELOCK = 2 days;
    uint128 public constant QUORUM = 100000 * 10**18;
    
    mapping(uint32 => uint64) public executionTime; // Time-lock tracking
    
    event ProposalCreated(uint32 indexed proposalId, ProposalType proposalType, ProposalCategory category);
    event VotedQuadratic(uint32 indexed proposalId, address voter, uint128 voteAmount, uint256 tokensCost);
    event ProposalExecuted(uint32 indexed proposalId, bool passed);
    
    constructor(address tokenAddress) {
        token = ParliamentToken(tokenAddress);
    }
    
    /**
     * @notice Create a proposal with category
     */
    function propose(
        ProposalType _type,
        ProposalCategory _category,
        string calldata _description,
        string calldata _ipfsHash
    ) external returns (uint32) {
        require(token.balanceOf(msg.sender) >= 1000 * 10**18, "Need 1000 tokens to propose");
        
        uint32 pid = proposalCounter++;
        uint64 deadline = uint64(block.timestamp) + VOTING_PERIOD;
        
        proposals[pid] = Proposal({
            votesFor: 0,
            votesAgainst: 0,
            deadline: deadline,
            proposalId: pid,
            proposalType: _type,
            category: _category,
            executed: false,
            passed: false
        });
        
        proposalDetails[pid] = _description;
        
        emit ProposalCreated(pid, _type, _category);
        return pid;
    }
    
    /**
     * @notice Quadratic voting: cost = votes^2
     * @param proposalId Proposal to vote on
     * @param voteAmount Number of votes (will cost voteAmount^2 tokens)
     * @param support True for yes, false for no
     */
    function voteQuadratic(
        uint32 proposalId,
        uint128 voteAmount,
        bool support
    ) external {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp < prop.deadline, "Voting ended");
        require(!prop.executed, "Already executed");
        require(votes[proposalId][msg.sender] == 0, "Already voted");
        
        // Quadratic cost: votes^2
        uint256 tokensCost = uint256(voteAmount) * uint256(voteAmount) * 10**18;
        require(token.balanceOf(msg.sender) >= tokensCost, "Insufficient tokens");
        
        // Burn tokens for voting (prevents vote buying)
        token.transferFrom(msg.sender, address(0xdead), tokensCost);
        
        votes[proposalId][msg.sender] = voteAmount;
        
        if (support) {
            prop.votesFor += voteAmount;
        } else {
            prop.votesAgainst += voteAmount;
        }
        
        emit VotedQuadratic(proposalId, msg.sender, voteAmount, tokensCost);
    }
    
    /**
     * @notice Execute a passed proposal after timelock
     */
    function execute(uint32 proposalId) external {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp >= prop.deadline, "Voting still active");
        require(!prop.executed, "Already executed");
        
        uint128 totalVotes = prop.votesFor + prop.votesAgainst;
        require(uint256(totalVotes) * 10**18 >= QUORUM, "Quorum not met");
        
        // Check majority based on category
        uint256 requiredPercent;
        if (prop.category == ProposalCategory.Critical) {
            requiredPercent = 80;
        } else if (prop.category == ProposalCategory.Standard) {
            requiredPercent = 51;
        } else {
            requiredPercent = 33;
        }
        
        uint256 forPercent = (uint256(prop.votesFor) * 100) / uint256(totalVotes);
        prop.passed = forPercent >= requiredPercent;
        
        // Set timelock if passed
        if (prop.passed && executionTime[proposalId] == 0) {
            executionTime[proposalId] = uint64(block.timestamp) + TIMELOCK;
            return; // Must wait for timelock
        }
        
        require(block.timestamp >= executionTime[proposalId], "Timelock active");
        
        prop.executed = true;
        emit ProposalExecuted(proposalId, prop.passed);
        
        // Actual execution logic would go here
    }
    
    /**
     * @notice Get proposal details
     */
    function getProposal(uint32 proposalId) external view returns (
        Proposal memory prop,
        string memory details
    ) {
        return (proposals[proposalId], proposalDetails[proposalId]);
    }
}
