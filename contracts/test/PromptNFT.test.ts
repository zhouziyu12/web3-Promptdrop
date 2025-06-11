import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // 部署 PromptNFT 合约
  const PromptNFT = await ethers.getContractFactory("PromptNFT");
  const promptNFT = await PromptNFT.deploy(
    "PromptDrop NFT",
    "PROMPT",
    deployer.address
  );

  await promptNFT.waitForDeployment();
  const contractAddress = await promptNFT.getAddress();

  console.log("PromptNFT deployed to:", contractAddress);
  
  // 保存部署地址到文件
  const fs = require("fs");
  const deploymentInfo = {
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    network: "sepolia",
    timestamp: new Date().toISOString()
  };
  
  fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to deployment.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});