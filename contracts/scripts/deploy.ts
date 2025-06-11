import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Starting deployment...");
  
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  
  console.log("📝 Deploying contracts with the account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);

  // 部署 PromptNFT 合约
  console.log("\n🔨 Deploying PromptNFT...");
  const PromptNFT = await ethers.getContractFactory("PromptNFT");
  const promptNFT = await PromptNFT.deploy(
    "PromptDrop NFT",
    "PROMPT",
    deployer.address
  );

  await promptNFT.waitForDeployment();
  const contractAddress = await promptNFT.getAddress();

  console.log("✅ PromptNFT deployed to:", contractAddress);
  
  // 保存部署信息
  const deploymentInfo = {
    contractAddress: contractAddress,
    contractName: "PromptNFT",
    deployerAddress: deployer.address,
    network: network.name,
    chainId: network.chainId.toString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    transactionHash: promptNFT.deploymentTransaction()?.hash
  };
  
  // 保存到 deployment.json
  fs.writeFileSync(
    path.join(__dirname, "..", "deployment.json"), 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // 保存到前端配置文件
  const frontendConfigPath = path.join(__dirname, "..", "..", "frontend", "src", "config", "contracts.ts");
  const contractConfig = `// Auto-generated contract configuration
// Generated at: ${new Date().toISOString()}

export const PROMPT_NFT_ADDRESS = "${contractAddress}" as const;

export const PROMPT_NFT_ABI = [
  // Mint function
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "prompt", "type": "string" }
    ],
    "name": "mint",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Get prompt function
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getPrompt",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Get user tokens function
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getUserTokens",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Standard ERC721 functions
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "prompt", "type": "string" }
    ],
    "name": "TokenMinted",
    "type": "event"
  }
] as const;

export const DEPLOYMENT_INFO = ${JSON.stringify(deploymentInfo, null, 2)} as const;
`;

  // 确保目录存在
  const configDir = path.dirname(frontendConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(frontendConfigPath, contractConfig);
  
  console.log("\n🎉 Deployment completed!");
  console.log("📄 Deployment info saved to:", path.join(__dirname, "..", "deployment.json"));
  console.log("⚛️  Contract config saved to:", frontendConfigPath);
  
  // 验证合约（如果在公共测试网）
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Contract verification info:");
    console.log(`Run: npx hardhat verify --network ${network.name} ${contractAddress} "PromptDrop NFT" "PROMPT" ${deployer.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
