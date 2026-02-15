import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with the account:", deployer.address);

    const ParliamentToken = await ethers.getContractFactory("ParliamentToken");
    const parliamentToken = await ParliamentToken.deploy();

    await parliamentToken.waitForDeployment();

    console.log("ParliamentToken deployed to:", await parliamentToken.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
