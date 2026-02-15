// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ParliamentToken.sol";

/**
 * @title DAOGovernance
 * @notice Community governance for parliament decisions
 * Token holders vote on:
 * - Adding/removing agents
 * - Changing debate rules
 * - Allocating treasury
 */
contract DAOGovernance {
    
    ParliamentToken public token;
    
    enum ProposalType {
        AddAgent,
        RemoveAgent,
        ChangeRules,
        TreasuryAllocation
    }
    
    struct Proposal {
        uint256 proposalId;
        ProposalType proposalType;
        string description;
        string ipfsDetailsHash;
        address proposer;
        uint256 votesFor;
        uint256 votesAgainst;
        uint256 deadline;
        bool executed;
        bool passed;
    }
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    uint256 public proposalCounter;
    
    uint256 public constant VOTING_PERIOD = 7 days;
    uint256 public constant QUORUM = 100000 * 10**18; // 10% of supply
    
    event ProposalCreated(uint256 indexed proposalId, ProposalType proposalType);
    event Voted(uint256 indexed proposalId, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    
    constructor(address tokenAddress) {
        token = ParliamentToken(tokenAddress);
    }
    
    /**
     * @notice Create a new proposal
     */
    function propose(
        ProposalType proposalType,
        string memory description,
        string memory ipfsDetailsHash
    ) external returns (uint256) {
        require(token.stakedBalance(msg.sender) >= 1000 * 10**18, "Need 1000 staked to propose");
        
        proposalCounter++;
        uint256 proposalId = proposalCounter;
        
        proposals[proposalId] = Proposal({
            proposalId: proposalId,
            proposalType: proposalType,
            description: description,
            ipfsDetailsHash: ipfsDetailsHash,
            proposer: msg.sender,
            votesFor: 0,
            votesAgainst: 0,
            deadline: block.timestamp + VOTING_PERIOD,
            executed: false,
            passed: false
        });
        
        emit ProposalCreated(proposalId, proposalType);
        return proposalId;
    }
    
    /**
     * @notice Vote on a proposal
     */
    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        
        uint256 weight = token.stakedBalance(msg.sender);
        require(weight > 0, "No voting power");
        
        if (support) {
            proposal.votesFor += weight;
        } else {
            proposal.votesAgainst += weight;
        }
        
        hasVoted[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }
    
    /**
     * @notice Execute a proposal after voting period
     */
    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting ongoing");
        require(!proposal.executed, "Already executed");
        
        uint256 totalVotes = proposal.votesFor + proposal.votesAgainst;
        require(totalVotes >= QUORUM, "Quorum not met");
        
        proposal.executed = true;
        proposal.passed = proposal.votesFor > proposal.votesAgainst;
        
        emit ProposalExecuted(proposalId, proposal.passed);
        
        // Execution logic would be implemented here or triggered off-chain
    }
}
