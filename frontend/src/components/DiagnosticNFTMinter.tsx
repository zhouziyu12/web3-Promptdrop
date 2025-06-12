'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useReadContract } from 'wagmi';
import { parseEther, getAddress } from 'viem';
import { PROMPT_NFT_ADDRESS, PROMPT_NFT_ABI } from '@/config/contracts';

export function DiagnosticNFTMinter({ prompt }: { prompt: string }) {
  const [mintError, setMintError] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  // 诊断合约状态
  const { data: contractCode } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: [{"inputs":[],"name":"name","outputs":[{"type":"string"}],"stateMutability":"view","type":"function"}],
    functionName: 'name',
  });

  const addDiagnostic = (message: string) => {
    console.log('🔍', message);
    setDiagnostics(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostics = async () => {
    setDiagnostics([]);
    addDiagnostic('开始诊断...');
    
    // 1. 检查基本配置
    addDiagnostic(`合约地址: ${PROMPT_NFT_ADDRESS}`);
    addDiagnostic(`用户地址: ${address}`);
    addDiagnostic(`链ID: ${chainId}`);
    addDiagnostic(`Prompt长度: ${prompt.length}字符`);
    
    // 2. 检查合约是否存在
    if (contractCode) {
      addDiagnostic(`✅ 合约已部署，名称: ${contractCode}`);
    } else {
      addDiagnostic(`❌ 无法读取合约信息，可能未部署或ABI不匹配`);
    }
    
    // 3. 检查Etherscan
    addDiagnostic(`🔗 在Etherscan查看: https://sepolia.etherscan.io/address/${PROMPT_NFT_ADDRESS}`);
  };

  const attemptMint1 = async () => {
    addDiagnostic('尝试方法1: mint(address, string) - 免费');
    try {
      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: [{
          "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "prompt", "type": "string" }
          ],
          "name": "mint",
          "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'mint',
        args: [getAddress(address!), prompt],
      });
    } catch (error: any) {
      addDiagnostic(`❌ 方法1失败: ${error.message}`);
      setMintError(error.message);
    }
  };

  const attemptMint2 = async () => {
    addDiagnostic('尝试方法2: mint(address, string) - 付费0.001 ETH');
    try {
      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: [{
          "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "prompt", "type": "string" }
          ],
          "name": "mint",
          "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
          "stateMutability": "payable",
          "type": "function"
        }],
        functionName: 'mint',
        args: [getAddress(address!), prompt],
        value: parseEther('0.001'),
      });
    } catch (error: any) {
      addDiagnostic(`❌ 方法2失败: ${error.message}`);
      setMintError(error.message);
    }
  };

  const attemptMint3 = async () => {
    addDiagnostic('尝试方法3: safeMint(address, string)');
    try {
      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: [{
          "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "uri", "type": "string" }
          ],
          "name": "safeMint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'safeMint',
        args: [getAddress(address!), prompt],
      });
    } catch (error: any) {
      addDiagnostic(`❌ 方法3失败: ${error.message}`);
      setMintError(error.message);
    }
  };

  if (!isConnected) {
    return <div>请先连接钱包</div>;
  }

  return (
    <div className="bg-white/90 rounded-xl p-6 border border-red-200 shadow-lg">
      <h3 className="text-lg font-semibold text-red-800 mb-4">🔧 交易失败诊断工具</h3>
      
      {/* 诊断信息 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-xs">
        <div className="font-medium mb-2">诊断日志:</div>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {diagnostics.map((log, index) => (
            <div key={index} className="text-gray-600">{log}</div>
          ))}
        </div>
      </div>

      {/* 诊断按钮 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={runDiagnostics}
          className="bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
        >
          🔍 运行诊断
        </button>
        <button
          onClick={() => window.open(`https://sepolia.etherscan.io/address/${PROMPT_NFT_ADDRESS}`, '_blank')}
          className="bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
        >
          🔗 查看合约
        </button>
      </div>

      {/* 尝试不同的铸造方法 */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">尝试不同的铸造方法:</div>
        <div className="grid grid-cols-1 gap-2">
          <button
            onClick={attemptMint1}
            disabled={isPending}
            className="bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700 disabled:opacity-50"
          >
            方法1: 免费mint
          </button>
          <button
            onClick={attemptMint2}
            disabled={isPending}
            className="bg-orange-600 text-white py-2 px-4 rounded text-sm hover:bg-orange-700 disabled:opacity-50"
          >
            方法2: 付费mint (0.001 ETH)
          </button>
          <button
            onClick={attemptMint3}
            disabled={isPending}
            className="bg-purple-600 text-white py-2 px-4 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
          >
            方法3: safeMint
          </button>
        </div>
      </div>

      {/* 错误信息 */}
      {(mintError || writeError) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
          ❌ {mintError || writeError?.message}
        </div>
      )}

      {/* 交易状态 */}
      {hash && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <div>交易哈希: {hash}</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            在Etherscan查看 →
          </a>
          {isConfirming && <div className="text-blue-600">等待确认中...</div>}
          {isConfirmed && <div className="text-green-600">✅ 铸造成功！</div>}
        </div>
      )}

      {/* 常见问题解决方案 */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
        <div className="font-medium text-yellow-800 mb-2">🔧 常见失败原因:</div>
        <div className="space-y-1 text-yellow-700">
          <div>• 合约需要owner权限 - 检查是否用部署者账户</div>
          <div>• 函数名不匹配 - 可能是safeMint而不是mint</div>
          <div>• 需要付费 - 尝试发送少量ETH</div>
          <div>• Gas费不足 - 提高Gas Limit</div>
          <div>• 合约暂停 - 检查合约状态</div>
        </div>
      </div>
    </div>
  );
}
