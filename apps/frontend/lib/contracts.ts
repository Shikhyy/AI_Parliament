export const PARLIAMENT_TOKEN_ABI = [
    {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        type: "function",
    },
    {
        constant: true,
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        type: "function",
    },
    {
        inputs: [{ name: "recipient", type: "address" }, { name: "amount", type: "uint256" }],
        name: "transfer",
        outputs: [{ name: "", type: "bool" }],
        type: "function"
    },
    {
        inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
        name: "mintReward",
        outputs: [],
        type: "function"
    },
    {
        inputs: [{ name: "recipients", type: "address[]" }, { name: "amount", type: "uint256" }],
        name: "genesisDrop",
        outputs: [],
        type: "function"
    },
    {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "stake",
        outputs: [],
        type: "function"
    },
    {
        inputs: [{ name: "amount", type: "uint256" }],
        name: "unstake",
        outputs: [],
        type: "function"
    },
    {
        inputs: [{ name: "", type: "address" }],
        name: "stakedBalance",
        outputs: [{ name: "", type: "uint256" }],
        type: "function",
        stateMutability: "view"
    }
] as const;

export const DAO_GOVERNANCE_ABI = [
    {
        inputs: [],
        name: "proposalCounter",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ name: "", type: "uint256" }],
        name: "proposals",
        outputs: [
            { name: "proposalId", type: "uint256" },
            { name: "proposalType", type: "uint8" },
            { name: "description", type: "string" },
            { name: "ipfsDetailsHash", type: "string" },
            { name: "proposer", type: "address" },
            { name: "votesFor", type: "uint256" },
            { name: "votesAgainst", type: "uint256" },
            { name: "deadline", type: "uint256" },
            { name: "executed", type: "bool" },
            { name: "passed", type: "bool" }
        ],
        stateMutability: "view",
        type: "function"
    },
    {
        inputs: [{ name: "proposalType", type: "uint8" }, { name: "description", type: "string" }, { name: "ipfsDetailsHash", type: "string" }],
        name: "propose",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ name: "proposalId", type: "uint256" }, { name: "support", type: "bool" }],
        name: "vote",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ name: "proposalId", type: "uint256" }],
        name: "executeProposal",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function"
    },
    {
        inputs: [{ name: "", type: "uint256" }, { name: "", type: "address" }],
        name: "hasVoted",
        outputs: [{ name: "", type: "bool" }],
        stateMutability: "view",
        type: "function"
    }
] as const;

export const CONTRACTS = {
    PARLIAMENT_TOKEN: {
        address: process.env.NEXT_PUBLIC_PARLIAMENT_TOKEN_ADDRESS as `0x${string}`,
        abi: PARLIAMENT_TOKEN_ABI
    },
    DAO_GOVERNANCE: {
        address: process.env.NEXT_PUBLIC_DAO_GOVERNANCE_ADDRESS as `0x${string}`,
        abi: DAO_GOVERNANCE_ABI
    }
} as const;
