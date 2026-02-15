import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const AGENT_ADDRESSES_PATH = path.join(__dirname, "../../../apps/parliament-mcp/agent-addresses.json");
const TOKEN_ADDRESS = "0x1bDf20Fa0f282e494d19E3E88A4A3b1bb23D57d8";

async function main() {
    if (!fs.existsSync(AGENT_ADDRESSES_PATH)) {
        throw new Error(`Agent addresses file not found at ${AGENT_ADDRESSES_PATH}`);
    }

    const agentAddresses = JSON.parse(fs.readFileSync(AGENT_ADDRESSES_PATH, "utf-8"));
    const agentIds = Object.keys(agentAddresses);

    console.log(`Checking balances for ${agentIds.length} agents...`);

    const ParliamentToken = await ethers.getContractFactory("ParliamentToken");
    const token = ParliamentToken.attach(TOKEN_ADDRESS) as any;

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
