'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { PROMPT_NFT_ADDRESS, PROMPT_NFT_ABI } from '@/config/contracts';

interface NFTData {
  tokenId: string;
  isOwner: boolean;
  owner: string;
  prompt?: string;
  imageUrl?: string;
  cleanPrompt?: string;
}

export function EnhancedNFTGallery() {
  const { address, isConnected } = useAccount();
  const [nftList, setNftList] = useState<NFTData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFTData | null>(null);

  // 读取用户NFT余额
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: PROMPT_NFT_ADDRESS as `0x${string}`,
    abi: PROMPT_NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // 从prompt中提取图像URL
  const getImageFromPrompt = (prompt: string) => {
    const match = prompt.match(/\[图像URL:\s*(https?:\/\/[^\]]+)\]/);
    return match ? match[1] : null;
  };

  // 清理prompt文本
  const cleanPromptText = (prompt: string) => {
    return prompt
      .replace(/\[图像URL:.*?\]/g, '')
      .replace(/\[生成模型:.*?\]/g, '')
      .replace(/\[生成时间:.*?\]/g, '')
      .trim();
  };

  // 检查NFT所有权
  const checkNFT = async (tokenId: number) => {
    if (!address) return null;

    try {
      const response = await fetch('/api/check-nft-owner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenId,
          userAddress: address
        }),
      });

      const data = await response.json();
      
      if (data.isOwner) {
        let prompt = '';
        let imageUrl = '';
        
        if (data.tokenURI) {
          try {
            const metadata = JSON.parse(data.tokenURI);
            prompt = metadata.description || metadata.prompt || data.tokenURI;
          } catch {
            prompt = data.tokenURI;
          }
          
          imageUrl = getImageFromPrompt(prompt) || '';
        }

        return {
          tokenId: tokenId.toString(),
          isOwner: true,
          owner: data.owner,
          prompt: prompt,
          imageUrl: imageUrl,
          cleanPrompt: cleanPromptText(prompt)
        };
      }
      return null;
    } catch (error) {
      console.error(`检查Token ${tokenId}失败:`, error);
      return null;
    }
  };

  // 获取用户NFT列表
  const fetchNFTs = async () => {
    if (!address || !balance) return;
    
    setLoading(true);
    const nfts: NFTData[] = [];

    try {
      const balanceNumber = Number(balance);
      console.log(`用户NFT余额: ${balanceNumber}`);
      
      if (balanceNumber === 0) {
        setNftList([]);
        return;
      }

      // 检查前50个token ID
      for (let tokenId = 1; tokenId <= 50; tokenId++) {
        const result = await checkNFT(tokenId);
        
        if (result) {
          console.log(`找到Token ${tokenId}`);
          nfts.push(result);
          
          if (nfts.length >= balanceNumber) {
            break;
          }
        }
      }

      // 按tokenId排序
      nfts.sort((a, b) => parseInt(a.tokenId) - parseInt(b.tokenId));
      setNftList(nfts);
      console.log(`总共找到 ${nfts.length} 个NFT`);

    } catch (error) {
      console.error('获取NFT失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && balance !== undefined) {
      fetchNFTs();
    } else {
      setNftList([]);
    }
  }, [address, balance, isConnected]);

  const handleRefresh = async () => {
    await refetchBalance();
    await fetchNFTs();
  };

  if (!isConnected) {
    return (
      <div className="text-center text-gray-500 p-8 bg-white/50 rounded-lg">
        <div className="text-4xl mb-4">🖼️</div>
        <p className="text-lg">请连接钱包查看您的 NFT 收藏</p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-blue-200 p-6">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">🖼️</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">我的山海神兽NFT</h2>
            <p className="text-sm text-gray-600">
              共有 {balance?.toString() || '0'} 个 NFT
              {nftList.length > 0 && (
                <span className="text-green-600 ml-2">
                  (已加载 {nftList.length} 个)
                </span>
              )}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? '🔄 检查中...' : '🔄 刷新'}
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">正在检查您的NFT...</p>
        </div>
      )}

      {/* NFT网格 */}
      {!loading && nftList.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nftList.map((nft) => (
            <div
              key={nft.tokenId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer bg-white group"
              onClick={() => setSelectedNft(nft)}
            >
              {/* NFT图像 */}
              <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                {nft.imageUrl ? (
                  <img
                    src={nft.imageUrl}
                    alt={`山海神兽 #${nft.tokenId}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.log(`图像加载失败: ${nft.imageUrl}`);
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                      const parent = img.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div class="text-center">
                            <div class="text-4xl text-blue-500 mb-2">🐉</div>
                            <div class="text-sm text-gray-500">山海神兽</div>
                            <div class="text-xs text-blue-600 mt-1">#${nft.tokenId}</div>
                          </div>
                        `;
                      }
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl text-blue-500 mb-2">🐉</div>
                    <div className="text-sm text-gray-500">山海神兽</div>
                    <div className="text-xs text-blue-600 mt-1">#{nft.tokenId}</div>
                  </div>
                )}
              </div>

              {/* NFT信息 */}
              <div>
                <h3 className="font-bold text-gray-800 mb-2">
                  山海神兽 #{nft.tokenId}
                </h3>
                
                {nft.cleanPrompt && (
                  <div className="text-xs text-gray-600 mb-3 h-12 overflow-hidden leading-relaxed">
                    {nft.cleanPrompt.length > 80 
                      ? `${nft.cleanPrompt.substring(0, 80)}...` 
                      : nft.cleanPrompt
                    }
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Token ID: #{nft.tokenId}
                  </div>
                  <div className="flex items-center gap-2">
                    {nft.imageUrl && (
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        🎨 有图像
                      </span>
                    )}
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      ✓ 已验证
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!loading && nftList.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🎨</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            {balance && Number(balance) > 0 ? '正在检查NFT...' : '还没有 NFT'}
          </h3>
          <p className="text-gray-500 mb-4">
            {balance && Number(balance) > 0 
              ? '请稍等，正在检查您的NFT所有权...'
              : '去创建您的第一个山海神兽 NFT 吧！'
            }
          </p>
        </div>
      )}

      {/* NFT详情弹窗 */}
      {selectedNft && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  🐉 山海神兽 #{selectedNft.tokenId}
                </h3>
                <button
                  onClick={() => setSelectedNft(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 图像展示 */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">🎨 神兽图像</h4>
                  <div className="w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {selectedNft.imageUrl ? (
                      <img
                        src={selectedNft.imageUrl}
                        alt={`山海神兽 #${selectedNft.tokenId}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log(`弹窗图像加载失败: ${selectedNft.imageUrl}`);
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <div class="text-center">
                                <div class="text-6xl text-blue-500 mb-4">🐉</div>
                                <div class="text-gray-500">图像暂时无法显示</div>
                                <div class="text-xs text-gray-400 mt-2">可能是图像链接已过期</div>
                              </div>
                            `;
                          }
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl text-blue-500 mb-4">🐉</div>
                        <div className="text-gray-500">暂无图像</div>
                      </div>
                    )}
                  </div>
                  
                  {/* 图像操作按钮 */}
                  {selectedNft.imageUrl && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => window.open(selectedNft.imageUrl, '_blank')}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        🔍 查看原图
                      </button>
                      <button
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = selectedNft.imageUrl!;
                          a.download = `shanhai-beast-${selectedNft.tokenId}.png`;
                          a.click();
                        }}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        💾 下载图像
                      </button>
                    </div>
                  )}
                </div>

                {/* 信息展示 */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">📝 创作描述</h4>
                    <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-700 max-h-48 overflow-y-auto">
                      <div className="whitespace-pre-wrap">
                        {selectedNft.cleanPrompt || '暂无描述'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">🔧 技术信息</h4>
                    <div className="bg-blue-50 p-3 rounded-md text-sm space-y-1">
                      <div><span className="font-medium">Token ID:</span> #{selectedNft.tokenId}</div>
                      <div><span className="font-medium">所有者:</span> {selectedNft.owner?.slice(0,6)}...{selectedNft.owner?.slice(-4)}</div>
                      <div><span className="font-medium">合约地址:</span> {PROMPT_NFT_ADDRESS}</div>
                      <div><span className="font-medium">网络:</span> Sepolia 测试网</div>
                      {selectedNft.imageUrl && (
                        <div><span className="font-medium">图像状态:</span> <span className="text-green-600">✅ 已关联</span></div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <a
                      href={`https://sepolia.etherscan.io/token/${PROMPT_NFT_ADDRESS}?a=${selectedNft.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors text-sm text-center"
                    >
                      🔗 在Etherscan查看
                    </a>
                    <button
                      onClick={() => {
                        const info = {
                          tokenId: selectedNft.tokenId,
                          prompt: selectedNft.cleanPrompt,
                          imageUrl: selectedNft.imageUrl,
                          owner: selectedNft.owner,
                          contract: PROMPT_NFT_ADDRESS
                        };
                        navigator.clipboard.writeText(JSON.stringify(info, null, 2));
                        alert('NFT信息已复制到剪贴板！');
                      }}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-sm"
                    >
                      📋 复制信息
                    </button>
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