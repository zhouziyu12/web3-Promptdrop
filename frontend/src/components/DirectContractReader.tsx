// ===== 直接合约读取工具: /frontend/src/components/DirectContractReader.tsx =====
'use client';

import { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { PROMPT_NFT_ADDRESS } from '@/config/contracts';

export function DirectContractReader() {
  const { address, isConnected } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState<number>(1);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev.slice(-15), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 尝试不同的ABI来读取tokenURI
  const tokenURI_ABI1 = [
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "tokenURI",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  const prompts_ABI = [
    {
      "inputs": [{"name": "", "type": "uint256"}],
      "name": "prompts",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  const getPrompt_ABI = [
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "getPrompt",
      "outputs": [{"name": "", "type": "string"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  const ownerOf_ABI = [
    {
      "inputs": [{"name": "tokenId", "type": "uint256"}],
      "name": "ownerOf",
      "outputs": [{"name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const;

  // 尝试1: tokenURI函数
  const { data: tokenURI, error: tokenURIError } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: tokenURI_ABI1,
    functionName: 'tokenURI',
    args: [BigInt(selectedTokenId)],
  });

  // 尝试2: prompts映射
  const { data: promptsData, error: promptsError } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: prompts_ABI,
    functionName: 'prompts',
    args: [BigInt(selectedTokenId)],
  });

  // 尝试3: getPrompt函数
  const { data: getPromptData, error: getPromptError } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: getPrompt_ABI,
    functionName: 'getPrompt',
    args: [BigInt(selectedTokenId)],
  });

  // 尝试4: ownerOf确认所有权
  const { data: ownerData } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: ownerOf_ABI,
    functionName: 'ownerOf',
    args: [BigInt(selectedTokenId)],
  });

  const testContractReads = () => {
    addLog(`=== 测试Token ${selectedTokenId} ===`);
    addLog(`合约地址: ${PROMPT_NFT_ADDRESS}`);
    addLog(`当前用户: ${address}`);
    addLog(`Token所有者: ${ownerData}`);
    addLog(`是否拥有: ${ownerData?.toLowerCase() === address?.toLowerCase()}`);
    
    if (tokenURI) {
      addLog(`✅ tokenURI(): ${tokenURI}`);
    } else if (tokenURIError) {
      addLog(`❌ tokenURI() 错误: ${tokenURIError.message}`);
    } else {
      addLog(`⏳ tokenURI() 加载中...`);
    }

    if (promptsData) {
      addLog(`✅ prompts[${selectedTokenId}]: ${promptsData}`);
    } else if (promptsError) {
      addLog(`❌ prompts[${selectedTokenId}] 错误: ${promptsError.message}`);
    } else {
      addLog(`⏳ prompts[${selectedTokenId}] 加载中...`);
    }

    if (getPromptData) {
      addLog(`✅ getPrompt(${selectedTokenId}): ${getPromptData}`);
    } else if (getPromptError) {
      addLog(`❌ getPrompt(${selectedTokenId}) 错误: ${getPromptError.message}`);
    } else {
      addLog(`⏳ getPrompt(${selectedTokenId}) 加载中...`);
    }
  };

  // 测试check-nft-owner API
  const testAPI = async () => {
    if (!address) return;
    
    addLog(`=== 测试API Token ${selectedTokenId} ===`);
    try {
      const response = await fetch('/api/check-nft-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: selectedTokenId,
          userAddress: address
        }),
      });

      const data = await response.json();
      addLog(`API响应: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      addLog(`API错误: ${error}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center text-gray-500 p-8 bg-white/50 rounded-lg">
        <p>请连接钱包</p>
      </div>
    );
  }

  const isOwner = ownerData?.toLowerCase() === address?.toLowerCase();

  return (
    <div className="bg-white/90 rounded-lg shadow-xl border border-red-200 p-6">
      <h2 className="text-2xl font-bold text-red-800 mb-4">🔧 直接合约读取测试</h2>
      
      {/* Token选择器 */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <label className="block text-sm font-medium text-blue-800 mb-2">
          选择要测试的Token ID:
        </label>
        <div className="flex items-center gap-4">
          <input
            type="number"
            min="1"
            max="20"
            value={selectedTokenId}
            onChange={(e) => setSelectedTokenId(parseInt(e.target.value) || 1)}
            className="border border-blue-300 rounded px-3 py-2 w-20"
          />
          <button
            onClick={testContractReads}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            测试合约读取
          </button>
          <button
            onClick={testAPI}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            测试API
          </button>
        </div>
      </div>

      {/* 实时数据显示 */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 rounded">
          <div className="font-medium text-gray-700 mb-2">基本信息</div>
          <div className="text-sm space-y-1">
            <div>Token ID: {selectedTokenId}</div>
            <div>所有者: {ownerData ? `${ownerData.slice(0,6)}...${ownerData.slice(-4)}` : '加载中...'}</div>
            <div>是否拥有: {isOwner ? '✅ 是' : '❌ 否'}</div>
          </div>
        </div>

        <div className="p-3 bg-gray-50 rounded">
          <div className="font-medium text-gray-700 mb-2">合约状态</div>
          <div className="text-sm space-y-1">
            <div>合约: {PROMPT_NFT_ADDRESS.slice(0,6)}...{PROMPT_NFT_ADDRESS.slice(-4)}</div>
            <div>网络: Sepolia</div>
            <div>用户: {address?.slice(0,6)}...{address?.slice(-4)}</div>
          </div>
        </div>
      </div>

      {/* 数据展示区域 */}
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <div className="font-medium text-yellow-800 mb-2">方法1: tokenURI()</div>
          <div className="text-sm text-yellow-700">
            {tokenURIError ? (
              <div className="text-red-600">错误: {tokenURIError.message}</div>
            ) : tokenURI ? (
              <div className="break-all bg-white p-2 rounded">
                长度: {tokenURI.length} 字符<br/>
                内容: {tokenURI || '(空字符串)'}
              </div>
            ) : (
              <div>加载中...</div>
            )}
          </div>
        </div>

        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <div className="font-medium text-green-800 mb-2">方法2: prompts[tokenId]</div>
          <div className="text-sm text-green-700">
            {promptsError ? (
              <div className="text-red-600">错误: {promptsError.message}</div>
            ) : promptsData ? (
              <div className="break-all bg-white p-2 rounded">
                长度: {promptsData.length} 字符<br/>
                内容: {promptsData || '(空字符串)'}
              </div>
            ) : (
              <div>加载中...</div>
            )}
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <div className="font-medium text-blue-800 mb-2">方法3: getPrompt(tokenId)</div>
          <div className="text-sm text-blue-700">
            {getPromptError ? (
              <div className="text-red-600">错误: {getPromptError.message}</div>
            ) : getPromptData ? (
              <div className="break-all bg-white p-2 rounded">
                长度: {getPromptData.length} 字符<br/>
                内容: {getPromptData || '(空字符串)'}
              </div>
            ) : (
              <div>加载中...</div>
            )}
          </div>
        </div>
      </div>

      {/* 调试日志 */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <div className="font-medium text-gray-700 mb-2">调试日志</div>
        <div className="max-h-48 overflow-y-auto text-xs space-y-1">
          {debugLogs.map((log, index) => (
            <div key={index} className="text-gray-600 font-mono">{log}</div>
          ))}
        </div>
        <button
          onClick={() => setDebugLogs([])}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          清空日志
        </button>
      </div>

      {/* 发现有效数据时的提示 */}
      {(tokenURI || promptsData || getPromptData) && (
        <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
          <div className="font-medium text-green-800 mb-2">🎉 发现数据！</div>
          <div className="text-sm text-green-700">
            找到了NFT内容，现在可以修复图鉴显示问题了。请告诉我哪个方法返回了有效数据。
          </div>
        </div>
      )}
    </div>
  );
}