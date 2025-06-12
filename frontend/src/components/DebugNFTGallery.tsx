// ===== 调试版NFT图鉴: /frontend/src/components/DebugNFTGallery.tsx =====
'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { PROMPT_NFT_ADDRESS, PROMPT_NFT_ABI } from '@/config/contracts';

interface DebugNFT {
  tokenId: string;
  isOwner: boolean;
  owner: string;
  rawTokenURI?: string;
  extractedImageUrl?: string;
  cleanPrompt?: string;
  debugInfo?: any;
}

export function DebugNFTGallery() {
  const { address, isConnected } = useAccount();
  const [nftList, setNftList] = useState<DebugNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState<DebugNFT | null>(null);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // 读取用户NFT余额
  const { data: balance } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: PROMPT_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // 检查单个NFT的详细信息
  const checkNFTDetails = async (tokenId: number) => {
    if (!address) return null;

    addLog(`检查Token ${tokenId}...`);

    try {
      // 1. 先用check-nft-owner API
      const response = await fetch('/api/check-nft-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenId,
          userAddress: address
        }),
      });

      const data = await response.json();
      addLog(`Token ${tokenId} API响应: ${JSON.stringify(data).substring(0, 100)}...`);
      
      if (data.isOwner) {
        // 分析tokenURI内容
        let imageUrl = '';
        let cleanPrompt = '';
        
        if (data.tokenURI) {
          addLog(`Token ${tokenId} 原始URI: ${data.tokenURI.substring(0, 100)}...`);
          
          // 尝试解析图像URL
          const imageMatch = data.tokenURI.match(/\[图像URL:\s*(https?:\/\/[^\]]+)\]/);
          if (imageMatch) {
            imageUrl = imageMatch[1];
            addLog(`Token ${tokenId} 找到图像URL: ${imageUrl}`);
          } else {
            addLog(`Token ${tokenId} 未找到图像URL格式`);
            
            // 尝试其他可能的格式
            const httpMatch = data.tokenURI.match(/(https?:\/\/[^\s\]]+)/);
            if (httpMatch) {
              imageUrl = httpMatch[1];
              addLog(`Token ${tokenId} 找到HTTP链接: ${imageUrl}`);
            }
          }
          
          // 清理prompt文本
          cleanPrompt = data.tokenURI
            .replace(/\[图像URL:.*?\]/g, '')
            .replace(/\[生成模型:.*?\]/g, '')
            .replace(/\[生成时间:.*?\]/g, '')
            .trim();
        }

        return {
          tokenId: tokenId.toString(),
          isOwner: true,
          owner: data.owner,
          rawTokenURI: data.tokenURI,
          extractedImageUrl: imageUrl,
          cleanPrompt: cleanPrompt,
          debugInfo: data
        };
      } else {
        addLog(`Token ${tokenId} 不属于当前用户`);
      }
      return null;
    } catch (error) {
      addLog(`Token ${tokenId} 检查失败: ${error}`);
      return null;
    }
  };

  // 获取所有NFT
  const fetchAllNFTs = async () => {
    if (!address || !balance) return;
    
    setLoading(true);
    setDebugLogs([]);
    addLog('开始获取NFT列表...');
    
    const nfts: DebugNFT[] = [];
    const balanceNumber = Number(balance);
    addLog(`用户余额: ${balanceNumber}`);

    try {
      // 检查前30个token ID
      for (let tokenId = 1; tokenId <= 30; tokenId++) {
        const result = await checkNFTDetails(tokenId);
        
        if (result) {
          nfts.push(result);
          addLog(`添加Token ${tokenId}到列表`);
          
          if (nfts.length >= balanceNumber) {
            addLog(`已找到足够的NFT (${nfts.length}/${balanceNumber})`);
            break;
          }
        }
      }

      nfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
      setNftList(nfts);
      addLog(`总共找到 ${nfts.length} 个NFT`);

    } catch (error) {
      addLog(`获取NFT失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && balance !== undefined) {
      fetchAllNFTs();
    }
  }, [address, balance, isConnected]);

  if (!isConnected) {
    return (
      <div className="text-center text-gray-500 p-8 bg-white/50 rounded-lg">
        <div className="text-4xl mb-4">🖼️</div>
        <p className="text-lg">请连接钱包查看您的 NFT 收藏</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 rounded-lg shadow-xl border border-blue-200 p-6">
      {/* 调试控制台 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">🔍 调试信息</h3>
          <button
            onClick={fetchAllNFTs}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            重新检查
          </button>
        </div>
        <div className="max-h-32 overflow-y-auto text-xs space-y-1">
          {debugLogs.map((log, index) => (
            <div key={index} className="text-gray-600 font-mono">{log}</div>
          ))}
        </div>
      </div>

      {/* 标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">调试版NFT图鉴</h2>
          <p className="text-sm text-gray-600">
            共有 {balance?.toString() || '0'} 个 NFT (已加载 {nftList.length} 个)
          </p>
        </div>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">正在调试检查NFT...</p>
        </div>
      )}

      {/* NFT列表 */}
      {!loading && nftList.length > 0 && (
        <div className="space-y-4">
          {nftList.map((nft) => (
            <div
              key={nft.tokenId}
              className="border border-gray-200 rounded-lg p-4 bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedNft(nft)}
            >
              <div className="flex items-start gap-4">
                {/* 图像显示 */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                  {nft.extractedImageUrl ? (
                    <>
                      <img
                        src={nft.extractedImageUrl}
                        alt={`神兽 #${nft.tokenId}`}
                        className="w-full h-full object-cover"
                        onLoad={() => addLog(`Token ${nft.tokenId} 图像加载成功`)}
                        onError={() => {
                          addLog(`Token ${nft.tokenId} 图像加载失败: ${nft.extractedImageUrl}`);
                        }}
                      />
                    </>
                  ) : (
                    <div className="text-center">
                      <div className="text-2xl text-blue-500">🐉</div>
                      <div className="text-xs text-gray-500">#{nft.tokenId}</div>
                    </div>
                  )}
                </div>

                {/* NFT信息 */}
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 mb-1">
                    山海神兽 #{nft.tokenId}
                  </h3>
                  
                  {/* 显示解析状态 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      Token #{nft.tokenId}
                    </span>
                    {nft.extractedImageUrl ? (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        ✅ 有图像
                      </span>
                    ) : (
                      <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                        ⚠️ 无图像
                      </span>
                    )}
                  </div>
                  
                  {/* prompt预览 */}
                  {nft.cleanPrompt && (
                    <div className="text-xs text-gray-600 mb-2">
                      {nft.cleanPrompt.length > 80 
                        ? `${nft.cleanPrompt.substring(0, 80)}...` 
                        : nft.cleanPrompt
                      }
                    </div>
                  )}

                  {/* 调试信息预览 */}
                  <div className="text-xs text-gray-500">
                    <div>原始URI长度: {nft.rawTokenURI?.length || 0} 字符</div>
                    {nft.extractedImageUrl && (
                      <div>图像URL: {nft.extractedImageUrl.substring(0, 50)}...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedNft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  🔍 调试详情 - Token #{selectedNft.tokenId}
                </h3>
                <button
                  onClick={() => setSelectedNft(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 图像显示 */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">🎨 图像显示</h4>
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {selectedNft.extractedImageUrl ? (
                      <img
                        src={selectedNft.extractedImageUrl}
                        alt={`神兽 #${selectedNft.tokenId}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl text-blue-500 mb-4">🐉</div>
                        <div className="text-gray-500">未找到图像URL</div>
                      </div>
                    )}
                  </div>
                  
                  {selectedNft.extractedImageUrl && (
                    <div className="mt-3">
                      <div className="text-xs text-gray-600 mb-2">图像URL:</div>
                      <div className="text-xs text-blue-600 break-all bg-blue-50 p-2 rounded">
                        {selectedNft.extractedImageUrl}
                      </div>
                    </div>
                  )}
                </div>

                {/* 调试数据 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">📝 清理后的Prompt</h4>
                    <div className="bg-gray-50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                      {selectedNft.cleanPrompt || '无内容'}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">🔧 原始TokenURI</h4>
                    <div className="bg-yellow-50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                      {selectedNft.rawTokenURI || '无内容'}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">🐛 API响应数据</h4>
                    <div className="bg-blue-50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                      <pre>{JSON.stringify(selectedNft.debugInfo, null, 2)}</pre>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedNft.rawTokenURI || '');
                        alert('TokenURI已复制！');
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded text-sm"
                    >
                      📋 复制TokenURI
                    </button>
                    {selectedNft.extractedImageUrl && (
                      <button
                        onClick={() => window.open(selectedNft.extractedImageUrl, '_blank')}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-sm"
                      >
                        🔍 查看图像
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}