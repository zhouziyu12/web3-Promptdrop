// ===== 1. 增强的 PromptNFTMinter.tsx =====
'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId } from 'wagmi';
import { parseEther, getAddress } from 'viem';
import { PROMPT_NFT_ADDRESS, PROMPT_NFT_ABI } from '@/config/contracts';
import { AIPromptGenerator } from './AIPromptGenerator';
import { Edit3, Zap, CheckCircle, ExternalLink, AlertTriangle, Download, Eye, Sparkles } from 'lucide-react';

export function PromptNFTMinter() {
  const [prompt, setPrompt] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [generatedBy, setGeneratedBy] = useState<'ai' | 'manual' | null>(null);
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageMetadata, setImageMetadata] = useState<any>(null);
  const [mintError, setMintError] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // 读取合约信息用于调试
  const { data: contractOwner } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: [{"inputs":[],"name":"owner","outputs":[{"type":"address"}],"stateMutability":"view","type":"function"}],
    functionName: 'owner',
  });

  const { data: contractName } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: [{"inputs":[],"name":"name","outputs":[{"type":"string"}],"stateMutability":"view","type":"function"}],
    functionName: 'name',
  });

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `${timestamp}: ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-10), logMessage]);
  };

  // 生成图像
  const generateImage = async () => {
    if (!prompt.trim()) {
      setMintError('请先输入prompt');
      return;
    }

    setIsGeneratingImage(true);
    setMintError('');
    addDebugLog('开始生成图像...');
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size: "1024x1024",
          style: "ai山海经"
        }),
      });

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setImageMetadata(data);
        addDebugLog('图像生成成功');
      } else {
        throw new Error(data.error || '图像生成失败');
      }
    } catch (error: any) {
      addDebugLog(`图像生成失败: ${error.message}`);
      setMintError(`图像生成失败: ${error.message}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleAIPromptGenerated = (aiPrompt: string) => {
    setPrompt(aiPrompt);
    setGeneratedBy('ai');
    setIsManualMode(false);
  };

  const handleManualPromptChange = (manualPrompt: string) => {
    setPrompt(manualPrompt);
    setGeneratedBy('manual');
  };

  // 方法1: 标准mint (付费)
  const handleMint1 = async () => {
    if (!prompt.trim() || !address) return;
    setMintError('');
    addDebugLog('尝试方法1: mint(address, string) + 0.001 ETH');
    
    try {
      const fullPrompt = generatedImage 
        ? `${prompt}\n\n[图像URL: ${generatedImage}]\n[生成时间: ${new Date().toISOString()}]`
        : prompt;

      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: [{
          "inputs": [
            {"name": "to", "type": "address"},
            {"name": "prompt", "type": "string"}
          ],
          "name": "mint",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "payable",
          "type": "function"
        }],
        functionName: 'mint',
        args: [getAddress(address), fullPrompt],
        value: parseEther('0.001'),
      });
      addDebugLog('方法1: 交易已提交');
    } catch (error: any) {
      const errorMsg = `方法1失败: ${error.message}`;
      addDebugLog(errorMsg);
      setMintError(errorMsg);
    }
  };

  // 方法2: 免费mint
  const handleMint2 = async () => {
    if (!prompt.trim() || !address) return;
    setMintError('');
    addDebugLog('尝试方法2: mint(address, string) 免费');
    
    try {
      const fullPrompt = generatedImage 
        ? `${prompt}\n\n[图像URL: ${generatedImage}]\n[生成时间: ${new Date().toISOString()}]`
        : prompt;

      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: [{
          "inputs": [
            {"name": "to", "type": "address"},
            {"name": "prompt", "type": "string"}
          ],
          "name": "mint",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'mint',
        args: [getAddress(address), fullPrompt],
      });
      addDebugLog('方法2: 交易已提交');
    } catch (error: any) {
      const errorMsg = `方法2失败: ${error.message}`;
      addDebugLog(errorMsg);
      setMintError(errorMsg);
    }
  };

  // 方法3: safeMint
  const handleMint3 = async () => {
    if (!prompt.trim() || !address) return;
    setMintError('');
    addDebugLog('尝试方法3: safeMint(address, string)');
    
    try {
      const fullPrompt = generatedImage 
        ? `${prompt}\n\n[图像URL: ${generatedImage}]\n[生成时间: ${new Date().toISOString()}]`
        : prompt;

      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: [{
          "inputs": [
            {"name": "to", "type": "address"},
            {"name": "uri", "type": "string"}
          ],
          "name": "safeMint",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'safeMint',
        args: [getAddress(address), fullPrompt],
      });
      addDebugLog('方法3: 交易已提交');
    } catch (error: any) {
      const errorMsg = `方法3失败: ${error.message}`;
      addDebugLog(errorMsg);
      setMintError(errorMsg);
    }
  };

  const clearPrompt = () => {
    setPrompt('');
    setGeneratedBy(null);
    setGeneratedImage('');
    setImageMetadata(null);
    setMintError('');
    setDebugLogs([]);
  };

  if (!isConnected) {
    return (
      <div className="text-center text-gray-500 p-8 bg-white/50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-4">🔗</div>
        <p className="text-lg">请先连接钱包来铸造 NFT</p>
      </div>
    );
  }

  const isCorrectNetwork = chainId === 11155111; // Sepolia

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 网络检查 */}
      {!isCorrectNetwork && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div className="text-yellow-800">
              <div className="font-medium">请切换到Sepolia测试网</div>
              <div className="text-sm">当前网络ID: {chainId}，需要: 11155111</div>
            </div>
          </div>
        </div>
      )}

      {/* 合约信息 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
        <div className="font-medium text-blue-800 mb-2">📋 合约信息</div>
        <div className="space-y-1 text-blue-700">
          <div>合约: {PROMPT_NFT_ADDRESS}</div>
          <div>名称: {contractName || '读取中...'}</div>
          <div>Owner: {contractOwner ? contractOwner.slice(0,6) + '...' + contractOwner.slice(-4) : '读取中...'}</div>
          <div>你是Owner: {contractOwner && address ? 
            (contractOwner.toLowerCase() === address.toLowerCase() ? '✅ 是' : '❌ 否') : 
            '检查中...'
          }</div>
        </div>
      </div>

      {/* AI 生成器或手动输入切换 */}
      <div className="flex justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setIsManualMode(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              !isManualMode
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            🤖 AI 生成
          </button>
          <button
            onClick={() => setIsManualMode(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              isManualMode
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            ✍️ 手动输入
          </button>
        </div>
      </div>

      {/* AI 生成器 */}
      {!isManualMode && (
        <AIPromptGenerator
          onPromptGenerated={handleAIPromptGenerated}
          isLoading={isPending || isConfirming}
        />
      )}

      {/* 手动输入 */}
      {isManualMode && (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Edit3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">手动输入 Prompt</h3>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => handleManualPromptChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="描述你想要的山海神兽，如：九尾火狐，身披金色鳞甲，眼若星辰..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {prompt.length}/500 字符
          </div>
        </div>
      )}

      {/* Prompt 预览和图像生成 */}
      {prompt && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border-2 border-green-200 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                {generatedBy === 'ai' ? '🤖 AI 生成的 Prompt' : '✍️ 手动输入的 Prompt'}
              </h3>
            </div>
            <button
              onClick={clearPrompt}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              清除
            </button>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border mb-4">
            <p className="text-gray-800 leading-relaxed">{prompt}</p>
          </div>

          {/* 图像生成按钮 */}
          <button
            onClick={generateImage}
            disabled={isGeneratingImage}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2 font-medium mb-4"
          >
            {isGeneratingImage ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                AI正在创作神兽中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                生成山海神兽图像
              </>
            )}
          </button>

          {/* 生成的图像 */}
          {generatedImage && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">🎨 生成的神兽图像:</h4>
              <div className="relative">
                <img
                  src={generatedImage}
                  alt="Generated Beast"
                  className="w-full rounded-lg shadow-md"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => window.open(generatedImage, '_blank')}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    title="全屏查看"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(generatedImage);
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `shanhai-beast-${Date.now()}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('下载失败:', error);
                      }
                    }}
                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    title="下载图像"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {generatedBy === 'ai' && (
            <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded">
              💡 此 prompt 由 AI 生成，你可以直接使用或在上方切换到手动模式进行编辑
            </div>
          )}
        </div>
      )}

      {/* 错误显示 */}
      {(mintError || writeError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 text-sm">
            ⚠️ {mintError || writeError?.message}
          </div>
        </div>
      )}

      {/* 铸造按钮组 */}
      {prompt && (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">⚡ 铸造山海神兽 NFT</h3>
            <p className="text-sm text-gray-600">尝试不同的铸造方法，找到有效的方式</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={handleMint1}
              disabled={isPending || isConfirming || !isCorrectNetwork}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Zap className="w-4 h-4" />
              方法1: 付费铸造 (0.001 ETH)
            </button>

            <button
              onClick={handleMint2}
              disabled={isPending || isConfirming || !isCorrectNetwork}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Zap className="w-4 h-4" />
              方法2: 免费铸造
            </button>

            <button
              onClick={handleMint3}
              disabled={isPending || isConfirming || !isCorrectNetwork}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <Zap className="w-4 h-4" />
              方法3: safeMint
            </button>
          </div>

          {/* 状态显示 */}
          {isPending && (
            <div className="mt-4 text-center text-blue-600">
              ⏳ 等待确认交易...
            </div>
          )}
          
          {isConfirming && (
            <div className="mt-4 text-center text-orange-600">
              ⛓️ 交易确认中...
            </div>
          )}

          {hash && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-2">交易已提交</div>
              <div className="text-xs text-blue-600 font-mono break-all mb-2">
                {hash}
              </div>
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                在Etherscan查看详情 →
              </a>
              {isConfirmed && (
                <div className="flex items-center gap-2 text-green-600 font-medium mt-2">
                  <CheckCircle className="w-4 h-4" />
                  🎉 NFT 铸造成功！
                  <ExternalLink className="w-4 h-4" />
                </div>
              )}
            </div>
          )}

          {/* 调试日志 */}
          <div className="mt-4">
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showDebug ? '隐藏' : '显示'} 调试日志 ({debugLogs.length})
            </button>
            
            {showDebug && (
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs max-h-32 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <div className="text-gray-500">暂无日志</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="text-gray-600 font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}