'use client';

import { useState } from 'react';
import { ConnectWallet } from '@/components/ConnectWallet';
import { PromptNFTMinter } from '@/components/PromptNFTMinter';
import { EnhancedNFTGallery } from '@/components/EnhancedNFTGallery';// 使用简化版Gallery
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sparkles, Image, Info } from 'lucide-react';
import { DebugNFTGallery } from '@/components/DebugNFTGallery';
import { DirectContractReader } from '@/components/DirectContractReader';
import { FixedNFTGallery } from '@/components/FixedNFTGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'gallery' | 'about'>('create');

  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          {/* 头部 */}
          <header className="text-center mb-8">
            <div className="mb-6">
              <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-3">
                <span className="text-6xl">🐉</span>
                神图计划 ShanHaiVerse
              </h1>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                AI驱动的山海经神兽创作平台 · 让千年神话重获新生
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500 mb-6">
                <span className="bg-white/60 px-3 py-1 rounded-full">🤖 智谱CogView-4</span>
                <span className="bg-white/60 px-3 py-1 rounded-full">⛓️ Sepolia测试网</span>
                <span className="bg-white/60 px-3 py-1 rounded-full">🎨 中华神话</span>
                <span className="bg-white/60 px-3 py-1 rounded-full">🔮 链上NFT</span>
              </div>
            </div>
            <ConnectWallet />
          </header>

          {/* 导航标签 */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200 shadow-lg">
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'create'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                创作神兽
              </button>
              <button
                onClick={() => setActiveTab('gallery')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'gallery'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Image className="w-4 h-4" />
                我的图鉴
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'about'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Info className="w-4 h-4" />
                项目介绍
              </button>
            </div>
          </div>

          {/* 主要内容 */}
          <div className="transition-all duration-300">
            {/* 创作页面 */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🎨 创作你的山海神兽</h2>
                  <p className="text-gray-600">
                    用AI生成创意描述，然后生成独特的神兽图像，最后铸造成专属NFT
                  </p>
                  <div className="text-sm text-blue-600 mt-2">
                    💡 确保钱包连接到 <strong>Sepolia 测试网</strong>
                  </div>
                </div>
                <PromptNFTMinter />
              </div>
            )}

            {/* 图鉴页面 */}
            {activeTab === 'gallery' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">🖼️ 我的神兽图鉴</h2>
                  <p className="text-gray-600">
                    查看你收藏的所有山海神兽NFT，每一个都是独一无二的数字藏品
                  </p>
                  <div className="text-sm text-blue-600 mt-2">
                    🔍 使用check-nft-owner API智能检测NFT所有权
                  </div>
                </div>
                <EnhancedNFTGallery />
              </div>
            )}

            {activeTab === 'gallery' && (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🔍 调试版图鉴</h2>
      <p className="text-gray-600">查看NFT数据解析详情</p>
    </div>
    <DebugNFTGallery />
  </div>
)}

{activeTab === 'gallery' && (
  <div className="space-y-6">
    <DirectContractReader />
    <DebugNFTGallery />
  </div>
)}
{activeTab === 'gallery' && (
  <div className="space-y-6">
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">🖼️ 修复版图鉴</h2>
      <p className="text-gray-600">
        直接使用getPrompt()函数读取NFT内容
      </p>
    </div>
    <FixedNFTGallery />
  </div>
)}

            {/* 项目介绍页面 */}
            {activeTab === 'about' && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-lg">
                  <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    🐉 关于神图计划 ShanHaiVerse
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-blue-800 mb-3 flex items-center gap-2">
                          🤖 AI技术驱动
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          集成智谱CogView-4最新图像生成模型，支持中文prompt输入，
                          专门优化山海经风格的神兽创作，每次生成都独一无二。
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                          ⛓️ Sepolia测试网
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          部署在Sepolia测试网上，免费铸造和交易NFT。
                          每个创作都铸造成ERC721标准NFT，永久存储在区块链上。
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center gap-2">
                          🎭 文化传承
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          以《山海经》为文化内核，融合现代AI技术，
                          让古老的神话传说在Web3时代重新焕发生机。
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold text-orange-800 mb-3 flex items-center gap-2">
                          🔍 智能检测
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          使用check-nft-owner API智能检测NFT所有权，
                          自动识别不同的合约存储方式，确保准确显示用户资产。
                        </p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
                      <h3 className="text-xl font-bold mb-3 text-center">🌟 创作流程</h3>
                      <div className="grid md:grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-3xl mb-2">📝</div>
                          <div className="font-medium mb-1">1. 创建Prompt</div>
                          <div className="text-sm opacity-90">AI辅助或手动输入</div>
                        </div>
                        <div>
                          <div className="text-3xl mb-2">🎨</div>
                          <div className="font-medium mb-1">2. 生成图像</div>
                          <div className="text-sm opacity-90">CogView-4智能创作</div>
                        </div>
                        <div>
                          <div className="text-3xl mb-2">⚡</div>
                          <div className="font-medium mb-1">3. 铸造NFT</div>
                          <div className="text-sm opacity-90">Sepolia测试网上链</div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">🚀 技术特性</h3>
                      <div className="flex flex-wrap justify-center gap-3">
                        {[
                          'Next.js 15', 'Wagmi v2', 'RainbowKit', 'Tailwind CSS',
                          'TypeScript', 'Solidity', 'OpenZeppelin', 'Sepolia测试网',
                          'check-nft-owner API', 'Etherscan集成', '智谱CogView-4', 'Web3存储'
                        ].map((tech, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ 测试网说明</h3>
                      <div className="text-sm text-yellow-700 space-y-1">
                        <div>• 本项目部署在Sepolia测试网，所有交易都是免费的</div>
                        <div>• 请确保钱包切换到Sepolia网络 (链ID: 11155111)</div>
                        <div>• 可以从 <a href="https://sepoliafaucet.com" target="_blank" className="underline">Sepolia水龙头</a> 获取测试ETH</div>
                        <div>• NFT可以在 <a href="https://sepolia.etherscan.io" target="_blank" className="underline">Sepolia Etherscan</a> 上查看</div>
                      </div>
                    </div>

                    <div className="text-center pt-4 border-t border-gray-200">
                      <p className="text-gray-600 text-sm">
                        神图计划 ShanHaiVerse - 让千年神话在Web3时代重新绽放光芒 ✨
                      </p>
                      <p className="text-gray-500 text-xs mt-2">
                        Built with ❤️ for Hackathon 2024 • Deployed on Sepolia Testnet
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}
