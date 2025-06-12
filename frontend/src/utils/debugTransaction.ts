export async function debugContractCall(contractAddress: string) {
  console.log('🔍 开始诊断合约:', contractAddress);
  
  // 1. 检查合约是否存在
  try {
    const response = await fetch(`https://api-sepolia.etherscan.io/api?module=account&action=balance&address=${contractAddress}&tag=latest&apikey=YourApiKeyToken`);
    const data = await response.json();
    console.log('合约地址检查:', data);
  } catch (error) {
    console.error('无法连接到Etherscan API');
  }
  
  // 2. 验证合约是否已部署
  console.log('在Etherscan查看合约:', `https://sepolia.etherscan.io/address/${contractAddress}`);
}

// ===== 修复的合约配置: /frontend/src/config/contracts.ts =====
import { getAddress } from 'viem';

// 更新: 使用新的合约地址
const CONTRACT_ADDRESS_RAW = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0xDFFDEC1349d326173d825877a1D19267dDBbbe99';

export const PROMPT_NFT_ADDRESS = (() => {
  try {
    return getAddress(CONTRACT_ADDRESS_RAW);
  } catch (error) {
    console.error('Invalid contract address:', CONTRACT_ADDRESS_RAW);
    return '0x0000000000000000000000000000000000000000';
  }
})();

// 通用ABI - 适配不同的合约实现
export const PROMPT_NFT_ABI = [
  // 基础ERC721函数
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
  
  // 可能的mint函数变体1: 免费mint
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
  
  // 可能的mint函数变体2: 付费mint
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "prompt", "type": "string" }
    ],
    "name": "mint",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  
  // 可能的mint函数变体3: safeMint
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "safeMint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // tokenURI相关
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  
  // prompt存储相关
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "prompts",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
