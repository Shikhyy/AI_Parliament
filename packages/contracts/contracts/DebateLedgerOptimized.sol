// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DebateLedgerOptimized
 * @notice Gas-optimized version with batch operations and event-based storage
 */
contract DebateLedgerOptimized is Ownable {
    struct DebateRecord {
        uint64 id;
        uint64 timestamp;
        bool isFinalized;
    }

    struct Statement {
        uint64 debateId;
        uint64 timestamp;
        address agent;
    }

    uint64 public nextId;
    mapping(uint64 => DebateRecord) public debates;

    // Use events as cheap storage for historical data
    event DebateCreated(uint64 indexed id, string topic, string ipfsCid, uint64 timestamp);
    event StatementRecorded(uint64 indexed debateId, address indexed agent, string ipfsHash, uint64 timestamp);
    event DebateFinalized(uint64 indexed id, string finalIpfsCid);
    event StatementBatch(uint64 indexed debateId, string[] ipfsHashes, uint64 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Record a new debate (gas-optimized)
     * @param _topic Topic string
     * @param _ipfsCid IPFS content identifier
     */
    function recordDebate(string calldata _topic, string calldata _ipfsCid) external onlyOwner {
        uint64 id = nextId++;
        uint64 timestamp = uint64(block.timestamp);
        
        debates[id] = DebateRecord({
            id: id,
            timestamp: timestamp,
            isFinalized: false
        });
        
        emit DebateCreated(id, _topic, _ipfsCid, timestamp);
    }

    /**
     * @notice Batch record multiple statements (saves ~60% gas vs individual calls)
     * @param _debateId Debate ID
     * @param _ipfsHashes Array of IPFS hashes for statements
     */
    function recordStatementBatch(
        uint64 _debateId,
        string[] calldata _ipfsHashes
    ) external onlyOwner {
        require(debates[_debateId].id == _debateId, "Debate does not exist");
        require(!debates[_debateId].isFinalized, "Debate is finalized");
        
        emit StatementBatch(_debateId, _ipfsHashes, uint64(block.timestamp));
    }

    /**
     * @notice Finalize a debate
     * @param _id Debate ID
     * @param _finalIpfsCid Final transcript IPFS hash
     */
    function finalizeDebate(uint64 _id, string calldata _finalIpfsCid) external onlyOwner {
        require(debates[_id].id == _id, "Debate does not exist");
        require(!debates[_id].isFinalized, "Already finalized");
        
        debates[_id].isFinalized = true;
        emit DebateFinalized(_id, _finalIpfsCid);
    }

    /**
     * @notice Get debate info (minimal storage read)
     * @param _id Debate ID
     */
    function getDebate(uint64 _id) external view returns (DebateRecord memory) {
        return debates[_id];
    }

    /**
     * @notice Check if debate exists
     * @param _id Debate ID
     */
    function debateExists(uint64 _id) external view returns (bool) {
        return debates[_id].id == _id;
    }
}
