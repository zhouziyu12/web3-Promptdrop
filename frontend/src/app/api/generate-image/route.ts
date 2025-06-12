import { NextRequest, NextResponse } from 'next/server';

// 智谱CogView-4 API调用函数
async function generateImageWithCogView(prompt: string, size: string = "1024x1024") {
  const API_KEY = "3b8103a7988e4d07ad1ec8fe809ec686.vwWinLC2gkVWrTq5";
  const API_URL = "https://open.bigmodel.cn/api/paas/v4/images/generations";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "cogview-3",
        prompt: prompt,
        size: size,
        quality: "standard",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API调用失败: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('CogView API调用错误:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = "1024x1024", style = "default" } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '缺少prompt参数' },
        { status: 400 }
      );
    }

    console.log('开始生成图像:', { prompt, size, style });

    // 构建山海经风格的prompt
    const enhancedPrompt = buildShanHaiPrompt(prompt, style);
    console.log('增强后的prompt:', enhancedPrompt);

    // 调用智谱CogView-4 API
    const result = await generateImageWithCogView(enhancedPrompt, size);

    if (result.data && result.data[0] && result.data[0].url) {
      return NextResponse.json({
        success: true,
        imageUrl: result.data[0].url,
        originalPrompt: prompt,
        enhancedPrompt: enhancedPrompt,
        model: "cogview-3",
        size: size
      });
    } else {
      throw new Error('API返回数据格式异常');
    }

  } catch (error: any) {
    console.error('图像生成失败:', error);
    return NextResponse.json(
      { 
        error: '图像生成失败', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// 构建山海经风格的prompt
function buildShanHaiPrompt(originalPrompt: string, style: string): string {
  const styleMap: Record<string, string> = {
    'digital-art': '数字艺术风格，高清细腻',
    'oil-painting': '中国传统油画风格，浓墨重彩',
    'watercolor': '水墨画风格，意境深远',
    'anime': '动漫插画风格，色彩鲜明',
    'concept-art': '概念艺术风格，富有想象力',
    'surreal': '超现实主义风格，梦幻神秘',
    'vintage': '复古古典风格，古色古香',
    'ai山海经': '中国古代山海经插画风格，古典神话',
    'default': '精美插画风格'
  };

  const styleDescription = styleMap[style] || styleMap['default'];
  
  // 山海经元素库
  const shanHaiElements = [
    '云雾缭绕的仙山',
    '古老的神兽',
    '金光闪闪的鳞片',
    '神秘的符文',
    '飘逸的仙气',
    '古代的宫殿',
    '翠绿的竹林',
    '潺潺的溪流'
  ];

  // 随机选择1-2个山海经元素
  const selectedElements = shanHaiElements
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 2) + 1)
    .join('，');

  return `${originalPrompt}，${styleDescription}，融入${selectedElements}，中国古典神话色彩，4K高清，细节丰富，色彩饱满，富有艺术感`;
}