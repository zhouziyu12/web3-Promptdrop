# 🧠 PromptDrop

> Web3 + AI Prompt Creation & NFT Minting Platform

![License](https://img.shields.io/github/license/zhouziyu12/promptdrop)
![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-blue)
![Chainlink](https://img.shields.io/badge/Chainlink-VRF%20v2-blue)
![Deployed](https://img.shields.io/badge/Network-Sepolia-purple)

---

## 📌 Project Overview

PromptDrop is a decentralized platform for AI creators to mint prompts as NFTs.  
Core features already live:  
- AI-powered Prompt Generation (DeepSeek) & manual input  
- Mint prompt as ERC721 NFT  
- Wallet login (wagmi + RainbowKit) & balance display  
- View all your Prompt NFTs and their content

---

## ✨ Live Features

| Module         | Description                                       |
|----------------|---------------------------------------------------|
| 🟣 Prompt NFT  | Mint AI prompts as ERC721 NFTs                    |
| 🤖 AI Creator  | One-click AI prompt generator or manual input     |
| 👜 Wallet      | wagmi v1 + RainbowKit wallet connect, balance     |
| 🖼️ NFT Viewer | View all your prompt NFTs & on-chain prompt text   |

---

## 🧱 Tech Stack

- **Smart Contracts**: Solidity 0.8.20 + Hardhat + OpenZeppelin
- **Frontend**: Next.js 14 + Tailwind CSS + wagmi v1 + RainbowKit
- **Web3**: ethers.js 6.8+
- **Testnet**: Sepolia (Alchemy RPC)
- **Tooling**: hardhat-deploy, TypeChain

---

## 🗓️ Progress

| Date   | Progress                                                                 |
|--------|--------------------------------------------------------------------------|
| Day 1  | ✅ Scaffold + Alchemy, deployed `PromptNFT.sol`, frontend wallet connect |
| Day 2  | ✅ Integrated AI prompt generator, finished NFT minting flow             |
| Day 3  | ✅ "My NFTs" display, UI polish, AI/manual dual-mode prompt input        |
| Day 4  | ✅ Wallet balance, multi-wallet switch, frontend improvements            |

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
yarn install
2. Deploy contracts to Sepolia
bash
复制
cd packages/hardhat
yarn deploy --network sepolia
3. Start frontend
bash
复制
cd packages/nextjs
yarn dev
Open http://localhost:56900
Connect wallet → Mint your first Prompt NFT → View "My NFTs"

🌍 Deployed Contracts (Sepolia)
Contract	Address
PromptNFT	0xd1a31a1312cd0ac7d5d2d2017810c4c48ecb8764 (live)
PromptVRF	in development
Governor	in development
ERC20 Token	in development

🛡️ Security Notes
⚠️ Solidity ^0.8.20 for overflow safety

⚠️ ERC721 standard contract, owner security

⚠️ All wallet logic via wagmi v1 + RainbowKit

✅ Core functions tested via Hardhat + chai + ethers

💡 TODO & Roadmap
 Chainlink VRF daily prompt rewards

 DAO voting and proposals

 Prompt NFT marketplace integration

 DeFi token incentives

 L2 support (e.g. Base, Arbitrum)

🤝 Contributors
Created by @zhouziyu12 & teammate
Built for Chainlink Hackathon 2025

📄 License
MIT License © 2025 PromptDrop Team