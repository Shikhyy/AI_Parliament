import { Tool, ToolSchema } from "@modelcontextprotocol/sdk/types.js";
import { BlockchainService } from '../services/blockchain.js';
import { AGENT_REGISTRY } from '../agents/registry.js';
import { z } from "zod";

const blockchainService = new BlockchainService();

export const voteOnProposalTool: Tool = {
    name: "vote_on_proposal",
    description: "Cast a vote on an active governance proposal. Requires staking tokens first.",
    inputSchema: {
        type: "object",
        properties: {
            proposalId: {
                type: "number",
                description: "The ID of the proposal to vote on"
            },
            support: {
                type: "boolean",
                description: "True to vote FOR, False to vote AGAINST"
            },
            reasoning: {
                type: "string",
                description: "Brief explanation of why you are voting this way (for the record)"
            }
        },
        required: ["proposalId", "support"]
    }
};

export const stakeTokensTool: Tool = {
    name: "stake_tokens",
    description: "Stake PARL tokens to gain voting power. You typically need 1000 tokens to propose.",
    inputSchema: {
        type: "object",
        properties: {
            amount: {
                type: "string",
                description: "Amount of PARL tokens to stake (e.g. '100')"
            }
        },
        required: ["amount"]
    }
};

export const createProposalTool: Tool = {
    name: "create_proposal",
    description: "Submit a new proposal to the Parliament. Requires 1000 staked PARL.",
    inputSchema: {
        type: "object",
        properties: {
            description: {
                type: "string",
                description: "The text description of the proposal/motion."
            }
        },
        required: ["description"]
    }
};

export async function handleGovernanceTools(name: string, args: any, agentId: string) {
    // Validate agent existence
    if (!AGENT_REGISTRY[agentId]) {
        throw new Error(`Unknown agent: ${agentId}`);
    }

    switch (name) {
        case "vote_on_proposal":
            const voteHash = await blockchainService.castVote(agentId, args.proposalId, args.support);
            return {
                content: [
                    {
                        type: "text",
                        text: `Vote cast successfully! Transaction Hash: ${voteHash}. Reasoning logged: ${args.reasoning || "None"}`
                    }
                ]
            };

        case "stake_tokens":
            const stakeHash = await blockchainService.stakeTokens(agentId, args.amount);
            return {
                content: [
                    {
                        type: "text",
                        text: `Tokens staked successfully! Transaction Hash: ${stakeHash}. You now have increased voting power.`
                    }
                ]
            };

        case "create_proposal":
            const propHash = await blockchainService.createProposal(agentId, args.description);
            return {
                content: [
                    {
                        type: "text",
                        text: `Proposal submitted successfully! Transaction Hash: ${propHash}. It is now active for voting.`
                    }
                ]
            };

        default:
            throw new Error(`Unknown tool: ${name}`);
    }
}
