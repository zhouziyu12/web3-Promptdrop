import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia } from 'viem/chains';
import { PROMPT_NFT_ADDRESS, PROMPT_NFT_ABI } from '@/config/contracts';

// 根据你的网络配置选择
const client = createPublicClient({
  chain: sepolia, // 或者 mainnet，根据你的部署网络
  transport: http()
});

export async function POST(request: NextRequest) {
  try {
    const { tokenId, userAddress } = await request.json();

    if (!tokenId || !userAddress) {
      return NextResponse.json({ 
        error: 'TokenId and userAddress are required' 
      }, { status: 400 });
    }

    console.log(`检查 Token ${tokenId} 是否属于用户 ${userAddress}`);

    try {
      // 检查token所有者
      const owner = await client.readContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: PROMPT_NFT_ABI,
        functionName: 'ownerOf',
        args: [BigInt(tokenId)],
      });

      const isOwner = owner.toLowerCase() === userAddress.toLowerCase();

      if (!isOwner) {
        return NextResponse.json({ 
          isOwner: false,
          owner: owner,
          message: 'Token not owned by user'
        });
      }

      // 获取token URI
      const tokenURI = await client.readContract({
        address: PROMPT_NFT_ADDRESS as `0x${string}`,
        abi: PROMPT_NFT_ABI,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      });

      return NextResponse.json({
        isOwner: true,
        owner: owner,
        tokenURI: tokenURI,
        tokenId: tokenId
      });

    } catch (contractError: any) {
      console.log(`Token ${tokenId} 不存在或查询失败:`, contractError.message);
      
      // Token不存在的情况
      if (contractError.message?.includes('ERC721: invalid token ID') || 
          contractError.message?.includes('ERC721NonexistentToken')) {
        return NextResponse.json({ 
          isOwner: false,
          exists: false,
          message: 'Token does not exist'
        });
      }

      throw contractError;
    }

  } catch (error) {
    console.error('NFT 所有权检查错误:', error);
    return NextResponse.json({
      error: 'Failed to check NFT ownership',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'NFT 所有权检查 API',
    contract: PROMPT_NFT_ADDRESS,
    timestamp: new Date().toISOString()
  });
}