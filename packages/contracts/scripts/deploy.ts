import { ethers } from "hardhat";

async function main() {
    console.log("Deploying contracts with the account:", (await ethers.getSigners())[0].address);

    // 1. Deploy ParliamentRegistry
    const ParliamentRegistry = await ethers.getContractFactory("ParliamentRegistry");
    const registry = await ParliamentRegistry.deploy();
    await registry.waitForDeployment();
    console.log(`ParliamentRegistry deployed to: ${await registry.getAddress()}`);

    // 2. Deploy DebateSession
    const DebateSession = await ethers.getContractFactory("DebateSession");
    const debateSession = await DebateSession.deploy();
    await debateSession.waitForDeployment();
    console.log(`DebateSession deployed to: ${await debateSession.getAddress()}`);

    // 3. Deploy ParliamentToken
    const ParliamentToken = await ethers.getContractFactory("ParliamentToken");
    const token = await ParliamentToken.deploy();
    await token.waitForDeployment();
    console.log(`ParliamentToken deployed to: ${await token.getAddress()}`);

    // 4. Deploy ParliamentBadges
    const ParliamentBadges = await ethers.getContractFactory("ParliamentBadges");
    const badges = await ParliamentBadges.deploy();
    await badges.waitForDeployment();
    console.log(`ParliamentBadges deployed to: ${await badges.getAddress()}`);

    // 5. Deploy DAOGovernance
    const DAOGovernance = await ethers.getContractFactory("DAOGovernance");
    const governance = await DAOGovernance.deploy(await token.getAddress());
    await governance.waitForDeployment();
    console.log(`DAOGovernance deployed to: ${await governance.getAddress()}`);

    // verification logic could go here
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
