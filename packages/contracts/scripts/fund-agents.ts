import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const AGENT_ADDRESSES_PATH = path.join(__dirname, "../../../apps/parliament-mcp/agent-addresses.json");
const TOKEN_ADDRESS = "0x1bDf20Fa0f282e494d19E3E88A4A3b1bb23D57d8";

async function main() {
    if (!fs.existsSync(AGENT_ADDRESSES_PATH)) {
        throw new Error(`Agent addresses file not found at ${AGENT_ADDRESSES_PATH}. Run init-wallets.ts first.`);
    }

    const agentAddresses = JSON.parse(fs.readFileSync(AGENT_ADDRESSES_PATH, "utf-8"));
    const addresses = Object.values(agentAddresses) as string[];
    const agentIds = Object.keys(agentAddresses);

    console.log(`Found ${addresses.length} agents to fund.`);
    console.log("Agents:", agentIds.join(", "));

    const [deployer] = await ethers.getSigners();
    console.log("Funding from account:", deployer.address);

    const ParliamentToken = await ethers.getContractFactory("ParliamentToken");
    const token = ParliamentToken.attach(TOKEN_ADDRESS) as any; // Cast to any or defined type

    const balance = await token.balanceOf(deployer.address);
    console.log("Deployer balance:", ethers.formatUnits(balance, 18), "PARL");

    const AMOUNT_PER_AGENT = ethers.parseUnits("100", 18);
    const totalNeeded = AMOUNT_PER_AGENT * BigInt(addresses.length);

    if (balance < totalNeeded) {
        throw new Error(`Insufficient balance. Need ${ethers.formatUnits(totalNeeded, 18)} PARL.`);
    }

    console.log(`Executing genesisDrop for ${addresses.length} agents with 100 PARL each...`);

    const tx = await token.genesisDrop(addresses, AMOUNT_PER_AGENT);
    console.log("Transaction sent:", tx.hash);

    await tx.wait();
    console.log("Transaction confirmed!");

    for (const id of agentIds) {
        const addr = agentAddresses[id];
        const bal = await token.balanceOf(addr);
        console.log(`${id} (${addr}): ${ethers.formatUnits(bal, 18)} PARL`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
