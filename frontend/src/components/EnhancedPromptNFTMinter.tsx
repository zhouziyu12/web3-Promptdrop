'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { PROMPT_NFT_ADDRESS, PROMPT_NFT_ABI } from '@/config/contracts';
import { AIPromptGenerator } from './AIPromptGenerator';
import { ImageGenerator } from './ImageGenerator';
import { Edit3, Zap, CheckCircle, ExternalLink, Image as ImageIcon, AlertTriangle } from 'lucide-react';

export function EnhancedPromptNFTMinter() {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageMetadata, setImageMetadata] = useState<any>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [generatedBy, setGeneratedBy] = useState<'ai' | 'manual' | null>(null);
  const [currentStep, setCurrentStep] = useState<'prompt' | 'image' | 'mint'>('prompt');
  const [mintError, setMintError] = useState<string>('');
  
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const expectedChainId = 11155111; // Sepolia
  
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash });

  // 检查网络
  const isCorrectNetwork = chainId === expectedChainId;

  const handleAIPromptGenerated = (aiPrompt: string) => {
    setPrompt(aiPrompt);
    setGeneratedBy('ai');
    setIsManualMode(false);
    setCurrentStep('image');
  };

  const handleManualPromptChange = (manualPrompt: string) => {
    setPrompt(manualPrompt);
    setGeneratedBy('manual');
  };

  const handleImageGenerated = (imageUrl: string, metadata: any) => {
    setGeneratedImage(imageUrl);
    setImageMetadata(metadata);
    setCurrentStep('mint');
  };

  const handleMint = async () => {
    if (!prompt.trim() || !address) return;
    
    // 检查网络
    if (!isCorrectNetwork) {
      setMintError('请切换到Sepolia测试网');
      return;
    }

    // 检查合约地址
    if (!PROMPT_NFT_ADDRESS || PROMPT_NFT_ADDRESS === '0x...') {
      setMintError('合约地址未配置，请在.env.local中设置NEXT_PUBLIC_CONTRACT_ADDRESS');
      return;
    }

    setMintError('');
    
    try {
      console.log('开始铸造NFT:', {
        address,
        prompt: prompt.substring(0, 100),
        contract: PROMPT_NFT_ADDRESS,
        chainId
      });

      // 构建包含图像信息的完整prompt
      const fullPrompt = generatedImage 
        ? `${prompt}\n\n[图像URL: ${generatedImage}]\n[生成模型: ${imageMetadata?.model || 'CogView-3'}]\n[生成时间: ${new Date().toISOString()}]`
        : prompt;

      writeContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: PROMPT_NFT_ABI,
        functionName: 'mint',
        args: [address, fullPrompt],
        value: parseEther('0.001'), // 可能需要支付少量ETH作为gas
      });

    } catch (error: any) {
      console.error('铸造失败:', error);
      setMintError(`铸造失败: ${error.message || '未知错误'}`);
    }
  };

  const resetAll = () => {
    setPrompt('');
    setGeneratedImage('');
    setImageMetadata(null);
    setGeneratedBy(null);
    setCurrentStep('prompt');
    setMintError('');
  };

  const goBack = () => {
    if (currentStep === 'mint') {
      setCurrentStep('image');
    } else if (currentStep === 'image') {
      setCurrentStep('prompt');
    }
  };

  if (!isConnected) {
    return (
      <div className="text-center text-gray-500 p-8 bg-white/50 rounded-lg border border-gray-200">
        <div className="text-4xl mb-4">🔗</div>
        <p className="text-lg">请先连接钱包来铸造山海神兽 NFT</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 网络检查提示 */}
      {!isCorrectNetwork && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">网络不匹配</div>
              <div className="text-sm text-yellow-700">
                请切换到 Sepolia 测试网 (链ID: 11155111)，当前网络: {chainId}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 步骤指示器 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          {[
            { key: 'prompt', label: '1. 创建Prompt', icon: '📝' },
            { key: 'image', label: '2. 生成图像', icon: '🎨' },
            { key: 'mint', label: '3. 铸造NFT', icon: '⚡' }
          ].map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                currentStep === step.key 
                  ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                  : currentStep === 'mint' && step.key !== 'mint'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                <span>{step.icon}</span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {index < 2 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 第一步：Prompt生成 */}
      {currentStep === 'prompt' && (
        <>
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
              <div className="text-xs text-gray-500 mt-1 mb-4">
                {prompt.length}/500 字符
              </div>
              
              {prompt.trim() && (
                <button
                  onClick={() => setCurrentStep('image')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  下一步：生成图像 →
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* 第二步：图像生成 */}
      {currentStep === 'image' && prompt && (
        <>
          <div className="flex gap-4 mb-4">
            <button
              onClick={goBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← 返回修改Prompt
            </button>
            {generatedImage && (
              <button
                onClick={() => setCurrentStep('mint')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                继续铸造NFT →
              </button>
            )}
          </div>

          <ImageGenerator
            prompt={prompt}
            onImageGenerated={handleImageGenerated}
            isLoading={isPending || isConfirming}
          />
        </>
      )}

      {/* 第三步：NFT铸造 */}
      {currentStep === 'mint' && prompt && (
        <>
          <div className="flex gap-4 mb-4">
            <button
              onClick={goBack}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← 返回修改图像
            </button>
            <button
              onClick={resetAll}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
            >
              🔄 重新开始
            </button>
          </div>

          {/* NFT预览 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border-2 border-green-200 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                🐉 山海神兽 NFT 预览
              </h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* 图像预览 */}
              {generatedImage && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    神兽图像
                  </h4>
                  <img
                    src={generatedImage}
                    alt="Generated Beast"
                    className="w-full rounded-lg shadow-md border"
                  />
                </div>
              )}
              
              {/* Prompt内容 */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">📝 Prompt内容</h4>
                <div className="bg-gray-50 p-4 rounded-lg border h-full">
                  <p className="text-gray-800 leading-relaxed text-sm">{prompt}</p>
                  
                  {generatedBy === 'ai' && (
                    <div className="mt-3 text-xs text-purple-600 bg-purple-50 p-2 rounded">
                      🤖 AI生成的创意描述
                    </div>
                  )}
                  
                  {imageMetadata && (
                    <div className="mt-3 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      🎨 配套图像: {imageMetadata.model} • {imageMetadata.size}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 错误显示 */}
          {(mintError || writeError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-red-600 text-sm">
                ⚠️ {mintError || writeError?.message}
              </div>
            </div>
          )}

          {/* 铸造按钮 */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-lg">
            <div className="mb-4 text-sm text-gray-600">
              <div>合约地址: {PROMPT_NFT_ADDRESS}</div>
              <div>当前网络: {isCorrectNetwork ? 'Sepolia ✅' : `Chain ${chainId} ❌`}</div>
            </div>
            
            <button
              onClick={handleMint}
              disabled={isPending || isConfirming || !isCorrectNetwork}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium text-lg"
            >
              {isPending ? (
                '准备交易中...'
              ) : isConfirming ? (
                '⛓️ 链上确认中...'
              ) : !isCorrectNetwork ? (
                '⚠️ 请切换到Sepolia网络'
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  铸造山海神兽 NFT
                </>
              )}
            </button>

            {hash && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-800 mb-2">🔄 交易已提交</div>
                <div className="text-xs text-blue-600 font-mono break-all mb-2">
                  {hash}
                </div>
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  在Etherscan上查看 →
                </a>
                {isConfirmed && (
                  <div className="flex items-center gap-2 text-green-600 font-medium mt-2">
                    <CheckCircle className="w-4 h-4" />
                    🎉 山海神兽 NFT 铸造成功！
                    <ExternalLink className="w-4 h-4" />
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}