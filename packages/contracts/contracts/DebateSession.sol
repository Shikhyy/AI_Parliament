// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DebateSession
 * @notice Manages individual debate sessions with on-chain verification
 */
contract DebateSession is Ownable {
    
    enum Phase {
        Initialization,
        InitialPositions,
        SocraticQuestioning,
        EvidencePresentation,
        ArgumentRefinement,
        CoalitionBuilding,
        Synthesis,
        Completed
    }
    
    struct Debate {
        uint256 debateId;
        string topic;
        string ipfsTranscriptHash;  // Full debate on IPFS
        Phase currentPhase;
        string[] activeAgents;
        uint256 startTime;
        uint256 endTime;
        bool consensusReached;
        uint256 consensusPercentage;
        string finalPolicyIpfsHash;
        address initiator;
    }
    
    struct Statement {
        string agentId;
        string statementHash;  // Hash of statement content
        uint256 timestamp;
        string ipfsContentHash; // Full content on IPFS
        bytes agentSignature;   // Cryptographic proof
    }
    
    struct Vote {
        string agentId;
        bool support;
        uint256 confidence;  // 0-100
        string reasoning;
    }
    
    uint256 public debateCounter;
    mapping(uint256 => Debate) public debates;
    mapping(uint256 => Statement[]) public debateStatements;
    mapping(uint256 => Vote[]) public debateVotes;
    
    event DebateStarted(uint256 indexed debateId, string topic, address initiator);
    event PhaseAdvanced(uint256 indexed debateId, Phase newPhase);
    event StatementRecorded(uint256 indexed debateId, string agentId, uint256 timestamp);
    event VoteCast(uint256 indexed debateId, string agentId, bool support);
    event DebateCompleted(uint256 indexed debateId, bool consensusReached, string policyHash); // Fixed argument from policyHash to string
    
    constructor() Ownable(msg.sender) {}

    /**
     * @notice Initialize a new debate
     */
    function startDebate(
        string memory topic,
        string[] memory activeAgents
    ) external returns (uint256) {
        debateCounter++;
        uint256 debateId = debateCounter;
        
        debates[debateId] = Debate({
            debateId: debateId,
            topic: topic,
            ipfsTranscriptHash: "",
            currentPhase: Phase.Initialization,
            activeAgents: activeAgents,
            startTime: block.timestamp,
            endTime: 0,
            consensusReached: false,
            consensusPercentage: 0,
            finalPolicyIpfsHash: "",
            initiator: msg.sender
        });
        
        emit DebateStarted(debateId, topic, msg.sender);
        return debateId;
    }
    
    /**
     * @notice Record an agent statement (off-chain content stored on IPFS)
     */
    function recordStatement(
        uint256 debateId,
        string memory agentId,
        string memory statementHash,
        string memory ipfsContentHash,
        bytes memory agentSignature
    ) external onlyOwner {
        require(debates[debateId].startTime > 0, "Debate not found");
        require(uint(debates[debateId].currentPhase) < uint(Phase.Completed), "Debate ended");
        
        debateStatements[debateId].push(Statement({
            agentId: agentId,
            statementHash: statementHash,
            timestamp: block.timestamp,
            ipfsContentHash: ipfsContentHash,
            agentSignature: agentSignature
        }));
        
        emit StatementRecorded(debateId, agentId, block.timestamp);
    }
    
    /**
     * @notice Advance debate to next phase
     */
    function advancePhase(uint256 debateId) external onlyOwner {
        Debate storage debate = debates[debateId];
        require(uint(debate.currentPhase) < uint(Phase.Completed), "Already completed");
        
        debate.currentPhase = Phase(uint(debate.currentPhase) + 1);
        emit PhaseAdvanced(debateId, debate.currentPhase);
    }
    
    /**
     * @notice Record agent vote on final policy
     */
    function recordVote(
        uint256 debateId,
        string memory agentId,
        bool support,
        uint256 confidence,
        string memory reasoning
    ) external onlyOwner {
        debateVotes[debateId].push(Vote({
            agentId: agentId,
            support: support,
            confidence: confidence,
            reasoning: reasoning
        }));
        
        emit VoteCast(debateId, agentId, support);
    }
    
    /**
     * @notice Complete debate and record final policy
     */
    function completeDebate(
        uint256 debateId,
        string memory ipfsTranscriptHash,
        string memory finalPolicyIpfsHash, // Renamed for clarity in event emission
        bool consensusReached,
        uint256 consensusPercentage
    ) external onlyOwner {
        Debate storage debate = debates[debateId];
        require(uint(debate.currentPhase) < uint(Phase.Completed), "Already completed");
        
        debate.currentPhase = Phase.Completed;
        debate.endTime = block.timestamp;
        debate.ipfsTranscriptHash = ipfsTranscriptHash;
        debate.finalPolicyIpfsHash = finalPolicyIpfsHash;
        debate.consensusReached = consensusReached;
        debate.consensusPercentage = consensusPercentage;
        
        emit DebateCompleted(debateId, consensusReached, finalPolicyIpfsHash);
    }
    
    /**
     * @notice Get all statements for a debate
     */
    function getDebateStatements(uint256 debateId) 
        external 
        view 
        returns (Statement[] memory) 
    {
        return debateStatements[debateId];
    }
    
    /**
     * @notice Get debate results
     */
    function getDebate(uint256 debateId) 
        external 
        view 
        returns (Debate memory) 
    {
        return debates[debateId];
    }
}
