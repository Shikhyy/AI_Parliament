import { ViemWalletProvider } from "@coinbase/agentkit";
import { AGENT_REGISTRY } from './agents/registry.js';
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
import { baseSepolia } from "viem/chains";

dotenv.config();

const WALLET_DATA_FILE = path.join(__dirname, "../agent-wallets.json");

interface WalletData {
    [agentId: string]: any;
}

function loadWalletData(): WalletData {
    if (fs.existsSync(WALLET_DATA_FILE)) {
        return JSON.parse(fs.readFileSync(WALLET_DATA_FILE, "utf-8"));
    }
    return {};
}

async function saveWalletData(data: WalletData) {
    fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(data, null, 2));
}

async function initWallets() {
    console.log("Initializing wallets using LOCAL ViemWalletProvider (Bypassing CDP API)...");

    const walletData = loadWalletData();
    const agentAddresses: Record<string, string> = {};
    const agentIds = Object.keys(AGENT_REGISTRY);

    for (const id of agentIds) {
        if (walletData[id] && walletData[id].privateKey) {
            console.log(`Loading existing wallet for ${id}...`);
            const account = privateKeyToAccount(walletData[id].privateKey);
            agentAddresses[id] = account.address;
            console.log(`Loaded ${id}: ${account.address}`);
            continue;
        }

        console.log(`Creating new local wallet for ${id}...`);
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey);

        walletData[id] = {
            privateKey,
            address: account.address,
            networkId: "base-sepolia"
        };
        agentAddresses[id] = account.address;

        console.log(`✅ Created ${id}: ${account.address}`);

        await saveWalletData(walletData);
    }

    fs.writeFileSync(path.join(__dirname, "../agent-addresses.json"), JSON.stringify(agentAddresses, null, 2));

    console.log("Wallet initialization complete (Local Mode - Unique Wallets).");
    console.log("Agent Addresses:", JSON.stringify(agentAddresses, null, 2));

    return agentAddresses;
}

if (require.main === module) {
    initWallets().catch(console.error);
}

export { initWallets };
