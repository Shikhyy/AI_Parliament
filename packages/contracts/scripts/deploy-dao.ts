import { ethers } from "hardhat";

async function main() {
    const TOKEN_ADDRESS = "0x1bDf20Fa0f282e494d19E3E88A4A3b1bb23D57d8";

    console.log("Deploying DAOGovernance...");
    console.log("Token Address:", TOKEN_ADDRESS);

    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const dao = await DAOGovernance.deploy(TOKEN_ADDRESS);

    await dao.waitForDeployment();

    const address = await dao.getAddress();
    console.log("DAOGovernance deployed to:", address);

    // Verify command would be:
    // npx hardhat verify --network baseSepolia <address> <token_address>
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
