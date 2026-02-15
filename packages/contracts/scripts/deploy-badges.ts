import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying ParliamentBadges with account:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    const ParliamentBadges = await ethers.getContractFactory("ParliamentBadges");
    const badges = await ParliamentBadges.deploy();
    await badges.waitForDeployment();

    const address = await badges.getAddress();
    console.log(`\n✅ ParliamentBadges deployed to: ${address}`);
    console.log(`\nAdd this to your .env files:`);
    console.log(`PARLIAMENT_BADGES_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
