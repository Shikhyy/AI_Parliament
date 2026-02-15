import { ethers } from "hardhat";

async function main() {
    const tokenAddress = "0x3B1e422E7d23173Ab3eA9A2e6B8a99528385baE0"; // From previous deployment

    console.log("Deploying DAOGovernance...");
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const governance = await DAOGovernance.deploy(tokenAddress);
    await governance.waitForDeployment();

    console.log(`DAOGovernance deployed to: ${await governance.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
