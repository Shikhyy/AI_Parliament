// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ParliamentBadges is ERC721, Ownable {
    
    enum BadgeType {
        DebateParticipant,
        ConsensusBuilder,
        MindChanger,
        EvidenceChampion,
        DevilsAdvocate
    }
    
    struct Badge {
        BadgeType badgeType;
        uint256 debateId;
        string agentId;
        uint256 mintedAt;
        string metadataURI;
    }
    
    mapping(uint256 => Badge) public badges;
    uint256 public badgeCounter;
    
    constructor() ERC721("Parliament Badges", "PBADGE") Ownable(msg.sender) {}
    
    function mintBadge(
        address recipient,
        BadgeType badgeType,
        uint256 debateId,
        string memory agentId,
        string memory metadataURI
    ) external onlyOwner returns (uint256) {
        badgeCounter++;
        uint256 tokenId = badgeCounter;
        
        _mint(recipient, tokenId);
        
        badges[tokenId] = Badge({
            badgeType: badgeType,
            debateId: debateId,
            agentId: agentId,
            mintedAt: block.timestamp,
            metadataURI: metadataURI
        });
        
        return tokenId;
    }
}
