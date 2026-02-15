// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ParliamentRegistry
 * @notice Registry of all AI agents in the parliament
 * Each agent has an on-chain identity, reputation score, and performance metrics
 */
contract ParliamentRegistry {
    
    struct Agent {
        string agentId;           // "utilitarian", "environmental", etc.
        string name;              // "The Consequentialist"
        address owner;            // Who deployed/controls this agent
        uint256 reputationScore;  // 0-1000, based on performance
        uint256 debatesParticipated;
        uint256 positionsChanged; // Intellectual honesty metric
        uint256 citationsProvided;
        bool isActive;
        string ipfsMetadataHash;  // Points to full agent config on IPFS
    }
    
    mapping(string => Agent) public agents;
    mapping(address => bool) public authorizedDeployers;
    
    event AgentRegistered(string indexed agentId, address owner);
    event ReputationUpdated(string indexed agentId, uint256 newScore);
    
    modifier onlyAuthorized() {
        require(authorizedDeployers[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        authorizedDeployers[msg.sender] = true;
    }
    
    /**
     * @notice Register a new agent in the parliament
     */
    function registerAgent(
        string memory agentId,
        string memory name,
        string memory ipfsMetadataHash
    ) external onlyAuthorized {
        require(agents[agentId].owner == address(0), "Agent exists");
        
        agents[agentId] = Agent({
            agentId: agentId,
            name: name,
            owner: msg.sender,
            reputationScore: 500, // Start at middle
            debatesParticipated: 0,
            positionsChanged: 0,
            citationsProvided: 0,
            isActive: true,
            ipfsMetadataHash: ipfsMetadataHash
        });
        
        emit AgentRegistered(agentId, msg.sender);
    }
    
    /**
     * @notice Update agent reputation after debate
     */
    function updateReputation(
        string memory agentId,
        uint256 newScore
    ) external onlyAuthorized {
        require(newScore <= 1000, "Score too high");
        agents[agentId].reputationScore = newScore;
        emit ReputationUpdated(agentId, newScore);
    }
    
    /**
     * @notice Get agent details
     */
    function getAgent(string memory agentId) 
        external 
        view 
        returns (Agent memory) 
    {
        return agents[agentId];
    }
}
