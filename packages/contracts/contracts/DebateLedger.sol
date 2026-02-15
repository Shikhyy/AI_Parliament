// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DebateLedger is Ownable {
    struct DebateRecord {
        uint256 id;
        string topic;
        string ipfsCid; // Transcript hash
        uint256 timestamp;
        bool isFinalized;
    }

    uint256 public nextId;
    mapping(uint256 => DebateRecord) public debates;

    event DebateFinalized(uint256 id, string topic, string ipfsCid);

    constructor() Ownable(msg.sender) {}

    function recordDebate(string memory _topic, string memory _ipfsCid) public onlyOwner {
        debates[nextId] = DebateRecord(nextId, _topic, _ipfsCid, block.timestamp, true);
        emit DebateFinalized(nextId, _topic, _ipfsCid);
        nextId++;
    }

    function getDebate(uint256 _id) public view returns (DebateRecord memory) {
        return debates[_id];
    }
}
