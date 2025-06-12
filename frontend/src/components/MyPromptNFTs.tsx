'use client'

import { useAccount, useReadContract } from 'wagmi'
import PromptNFTJson from '@/abi/PromptNFT.json'
import { PROMPT_NFT_ADDRESS } from '@/config/contracts'
import { useState } from 'react'

const PromptNFTAbi = PromptNFTJson.abi

export function MyPromptNFTs() {
  const { address, isConnected } = useAccount()
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null)

  // 1. 读取当前钱包的所有NFT tokenId
  const { data: tokenIds, isLoading: isLoadingTokens } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: PromptNFTAbi,
    functionName: 'getUserTokens',
    args: [address],
    query: { enabled: !!address }
  })

  // 2. 读取选中 NFT 的 prompt
  const { data: promptContent, isLoading: isLoadingPrompt } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: PromptNFTAbi,
    functionName: 'getPrompt',
    args: selectedTokenId ? [selectedTokenId] : undefined,
    query: { enabled: selectedTokenId !== null }
  })

  if (!isConnected) {
    return <div className="text-gray-500 text-center">请先连接钱包</div>
  }

  if (isLoadingTokens) {
    return <div className="text-gray-500 text-center">正在加载你的 NFT...</div>
  }

  // 处理无 NFT
  if (!tokenIds || (Array.isArray(tokenIds) && tokenIds.length === 0)) {
    return <div className="text-gray-500 text-center">你还没有任何 Prompt NFT</div>
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-lg shadow-lg p-6 mt-10">
      <h2 className="text-xl font-bold mb-4">我的 Prompt NFT</h2>
      <ul className="space-y-2">
        {(tokenIds as bigint[]).map((tokenId, idx) => (
          <li key={tokenId.toString()} className="flex items-center justify-between">
            <span>Token #{tokenId.toString()}</span>
            <button
              className="text-blue-600 underline ml-2"
              onClick={() => setSelectedTokenId(Number(tokenId))}
            >
              查看内容
            </button>
          </li>
        ))}
      </ul>

      {selectedTokenId !== null && (
        <div className="mt-6 border-t pt-4">
          <div className="font-bold">Token #{selectedTokenId} 的 prompt:</div>
          {isLoadingPrompt
            ? <div className="text-gray-500">加载中...</div>
            : <div className="mt-2 bg-gray-100 p-3 rounded">{promptContent as string}</div>
          }
          <button
            className="mt-3 text-sm text-gray-500 underline"
            onClick={() => setSelectedTokenId(null)}
          >收起</button>
        </div>
      )}
    </div>
  )
}
