
import { JsonRpcProvider, Wallet, Contract, id, getBytes, HDNodeWallet, parseEther } from "ethers";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";

dotenv.config();

// ABI subsets needed for interaction
const REGISTRY_ABI = [
    "function registerAgent(string memory agentId, string memory name, string memory ipfsMetadataHash) external",
    "function updateReputation(string memory agentId, uint256 newScore) external",
    "function getAgent(string memory agentId) external view returns (tuple(string agentId, string name, address owner, uint256 reputationScore, uint256 debatesParticipated, uint256 positionsChanged, uint256 citationsProvided, bool isActive, string ipfsMetadataHash))"
];

const SESSION_ABI = [
    "function startDebate(string memory topic, string[] memory activeAgents) external returns (uint256)",
    "function recordStatement(uint256 debateId, string memory agentId, string memory statementHash, string memory ipfsContentHash, bytes memory agentSignature) external",
    "function completeDebate(uint256 debateId, string memory ipfsTranscriptHash, string memory finalPolicyIpfsHash, bool consensusReached, uint256 consensusPercentage) external"
];

const BADGES_ABI = [
    "function mintBadge(address recipient, uint8 badgeType, uint256 debateId, string memory agentId, string memory metadataURI) external returns (uint256)"
];

export class BlockchainService {
    private provider: JsonRpcProvider;
    private wallet: Wallet | HDNodeWallet;
    private registryContract: Contract;
    private sessionContract: Contract;
    private badgesContract: Contract | null = null;
    private isMock: boolean = false;

    constructor() {
        const rpcUrl = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
        const privateKey = process.env.PRIVATE_KEY;

        if (!privateKey) {
            console.warn("No PRIVATE_KEY found. Blockchain service will run in read-only/mock mode.");
            this.isMock = true;
            this.provider = new JsonRpcProvider(rpcUrl);
            this.wallet = Wallet.createRandom(this.provider); // Mock wallet
        } else {
            this.provider = new JsonRpcProvider(rpcUrl);
            this.wallet = new Wallet(privateKey, this.provider);
        }

        // Contract addresses
        const registryAddress = process.env.PARLIAMENT_REGISTRY_ADDRESS;
        const sessionAddress = process.env.DEBATE_SESSION_ADDRESS;
        const badgesAddress = process.env.PARLIAMENT_BADGES_ADDRESS;

        if (!registryAddress || !sessionAddress) {
            console.warn("Using mock addresses for blockchain service");
        }

        this.registryContract = new Contract(registryAddress || "0x0000000000000000000000000000000000000000", REGISTRY_ABI, this.wallet);
        this.sessionContract = new Contract(sessionAddress || "0x0000000000000000000000000000000000000000", SESSION_ABI, this.wallet);

        if (badgesAddress) {
            this.badgesContract = new Contract(badgesAddress, BADGES_ABI, this.wallet);
            console.log(`ParliamentBadges contract initialized at ${badgesAddress}`);
        } else {
            console.warn("PARLIAMENT_BADGES_ADDRESS not set. Badge minting will run in mock mode.");
        }
    }

    async registerAgentOnChain(agentId: string, name: string, ipfsHash: string) {
        if (this.isMock) {
            console.log(`[MOCK] Agent ${agentId} registered with hash ${ipfsHash}`);
            return "0x_mock_register_tx_hash_" + agentId;
        }
        try {
            const tx = await this.registryContract.registerAgent(agentId, name, ipfsHash);
            console.log(`Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`Agent ${agentId} registered based on hash ${ipfsHash}`);
            return tx.hash;
        } catch (error) {
            console.error("Error registering agent:", error);
            throw error;
        }
    }

    async startDebateOnChain(topic: string, activeAgents: string[]) {
        if (this.isMock) {
            console.log(`[MOCK] Debate started on topic: ${topic}`);
            return "0x_mock_start_debate_tx_" + Date.now();
        }
        try {
            const tx = await this.sessionContract.startDebate(topic, activeAgents);
            const receipt = await tx.wait();
            // Parse event to get ID? For now just return hash
            return receipt.hash;
        } catch (error) {
            console.error("Error starting debate:", error);
            // Fallback for demo if contracts aren't deployed/funded
            return "0x_mock_transaction_hash";
        }
    }

    async recordStatement(
        debateIdHex: string, // hex string of uint256
        agentId: string,
        statement: string,
        ipfsHash: string
    ) {
        if (this.isMock) {
            console.log(`[MOCK] Statement recorded for ${agentId}: ${statement.substring(0, 20)}...`);
            return "0x_mock_statement_tx_" + Date.now();
        }
        try {
            const statementHash = id(statement);
            // In production, agents would sign their own statements. 
            // Here we simulate agent signature with the server wallet for functionality.
            const signature = await this.wallet.signMessage(getBytes(statementHash));

            // Ensure debateId is a valid uint256. If it's a UUID, hash it.
            const numericDebateId = isNaN(Number(debateIdHex)) ? id(debateIdHex) : debateIdHex;

            const tx = await this.sessionContract.recordStatement(
                numericDebateId,
                agentId,
                statementHash,
                ipfsHash,
                signature
            );
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error("Error recording statement:", error);
            return "0x_mock_tx_hash";
        }
    }
    private loadAgentWallet(agentId: string): Wallet | HDNodeWallet {
        try {
            const walletPath = path.join(__dirname, "../../agent-wallets.json");
            if (!fs.existsSync(walletPath)) {
                throw new Error("Agent wallets file not found");
            }
            const walletData = JSON.parse(fs.readFileSync(walletPath, "utf-8"));
            if (!walletData[agentId] || !walletData[agentId].privateKey) {
                // Fallback to mock/generated wallet if not found (for dev safety)
                console.warn(`Wallet not found for ${agentId}, using random wallet.`);
                return Wallet.createRandom(this.provider);
            }
            return new Wallet(walletData[agentId].privateKey, this.provider);
        } catch (error) {
            console.error(`Failed to load wallet for ${agentId}:`, error);
            if (this.isMock) return Wallet.createRandom(this.provider);
            throw error;
        }
    }

    async stakeTokens(agentId: string, amount: string) {
        if (this.isMock) {
            console.log(`[MOCK] Agent ${agentId} staked ${amount} PARL`);
            return "0x_mock_stake_tx";
        }
        try {
            const wallet = this.loadAgentWallet(agentId);
            const tokenAddress = process.env.PARLIAMENT_TOKEN_ADDRESS;
            if (!tokenAddress) throw new Error("Token address not set");

            const tokenContract = new Contract(tokenAddress, [
                "function stake(uint256 amount) external",
                "function approve(address spender, uint256 amount) external returns (bool)"
            ], wallet);

            // Amount is expected in human readable (e.g. "100"), convert to wei
            const amountWei = parseEther(amount);

            // Stake
            const tx = await tokenContract.stake(amountWei);
            console.log(`Stake TX sent for ${agentId}: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error(`Error staking for ${agentId}:`, error);
            throw error;
        }
    }

    async castVote(agentId: string, proposalId: number, support: boolean) {
        if (this.isMock) {
            console.log(`[MOCK] Agent ${agentId} voted ${support} on Proposal ${proposalId}`);
            return "0x_mock_vote_tx";
        }
        try {
            const wallet = this.loadAgentWallet(agentId);
            const govAddress = process.env.DAO_GOVERNANCE_ADDRESS;
            if (!govAddress) throw new Error("Governance address not set");

            const govContract = new Contract(govAddress, [
                "function vote(uint256 proposalId, bool support) external"
            ], wallet);

            const tx = await govContract.vote(proposalId, support);
            console.log(`Vote TX sent for ${agentId}: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error(`Error voting for ${agentId}:`, error);
            throw error;
        }
    }

    async createProposal(agentId: string, description: string) {
        if (this.isMock) {
            console.log(`[MOCK] Agent ${agentId} created proposal: ${description}`);
            return "0x_mock_proposal_tx";
        }
        try {
            const wallet = this.loadAgentWallet(agentId);
            const govAddress = process.env.DAO_GOVERNANCE_ADDRESS;
            if (!govAddress) throw new Error("Governance address not set");

            const govContract = new Contract(govAddress, [
                "function propose(uint8 proposalType, string description, string ipfsDetailsHash) external returns (uint256)"
            ], wallet);

            // Defaulting to Type 0 (Generic) and mock IPFS hash for now
            const tx = await govContract.propose(0, description, "Qm_mock_ipfs_hash_auto_generated");
            console.log(`Proposal TX sent for ${agentId}: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error(`Error creating proposal for ${agentId}:`, error);
            throw error;
        }
    }

    async faucet(recipient: string): Promise<string> {
        if (this.isMock) {
            console.log(`[MOCK] Dispensing 100 PARL to ${recipient}`);
            return "0x_mock_faucet_tx_" + Date.now();
        }

        if (!this.wallet) throw new Error("Wallet not initialized");

        const tokenAddress = process.env.PARLIAMENT_TOKEN_ADDRESS;
        if (!tokenAddress) throw new Error("Token contract address not configured");

        const tokenAbi = [
            "function transfer(address to, uint256 amount) external returns (bool)",
            "function balanceOf(address owner) view returns (uint256)"
        ];

        const tokenContract = new Contract(tokenAddress, tokenAbi, this.wallet);

        // Check admin balance first
        const adminBalance = await tokenContract.balanceOf(this.wallet.address);
        const amount = parseEther("100");

        if (adminBalance < amount) {
            throw new Error("Faucet is empty! Admin wallet needs funding.");
        }

        console.log(`Dispensing 100 PARL to ${recipient}...`);
        const tx = await tokenContract.transfer(recipient, amount);
        await tx.wait();

        console.log(`Faucet success: ${tx.hash}`);
        return tx.hash;
    }

    async mintBadge(
        recipientAddress: string,
        badgeType: number,
        debateId: string,
        agentId: string,
        metadataURI: string = ""
    ): Promise<string> {
        if (this.isMock || !this.badgesContract) {
            console.log(`[MOCK] Badge minted: type=${badgeType} agent=${agentId} debate=${debateId}`);
            return "0x_mock_badge_tx_" + Date.now();
        }

        try {
            // Convert debateId (UUID) to a numeric hash for the contract
            const numericDebateId = BigInt(id(debateId));

            const tx = await this.badgesContract.mintBadge(
                recipientAddress,
                badgeType,
                numericDebateId,
                agentId,
                metadataURI || `badge://${agentId}/${debateId}/${badgeType}`
            );
            console.log(`Badge mint TX sent: ${tx.hash} (type=${badgeType}, agent=${agentId})`);
            await tx.wait();
            return tx.hash;
        } catch (error) {
            console.error(`Error minting badge for ${agentId}:`, error);
            return "0x_badge_mint_failed";
        }
    }
}
