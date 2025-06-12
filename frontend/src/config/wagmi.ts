import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'PromptDrop',
  // 这里必须用 process.env 读取
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia, hardhat],
  transports: {
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`),
    [hardhat.id]: http('http://127.0.0.1:8545'),
  },
});
