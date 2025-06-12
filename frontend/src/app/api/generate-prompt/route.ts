import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { direction, style } = await request.json();

    if (!direction) {
      return NextResponse.json({ error: 'Direction is required' }, { status: 400 });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const apiUrl = 'https://api.deepseek.com/v1'; // 固定地址，防止 undefined

    if (!apiKey) {
      console.error('DeepSeek API key not configured');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    console.log('Calling DeepSeek API:', apiUrl);

    const systemPrompt = `你是一个专业的 AI 艺术 prompt 工程师。你的任务是根据用户提供的方向和风格，生成高质量、详细的艺术创作 prompt。
生成的 prompt 应该：
1. 具体而详细，包含视觉元素
2. 适合 AI 艺术生成工具（如 Midjourney、DALL-E、Stable Diffusion）
3. 包含艺术风格、光影、构图等专业术语
4. 长度在 50-300 个字之间
5. 使用中文，专业且富有创意
6. 可以偏向于使用AI山海经的样子
请只返回生成的 prompt 内容，不要包含额外的解释。`;

    const userPrompt = `请为以下方向生成一个专业的艺术创作 prompt：
方向：${direction}
${style ? `风格偏好：${style}` : ''}
要求：创意独特，视觉冲击力强，适合制作成 NFT 艺术品。`;

    const response = await fetch(`${apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.8,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return NextResponse.json({ error: 'Failed to generate prompt' }, { status: response.status });
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content?.trim();

    if (!generatedPrompt) {
      return NextResponse.json({ error: 'No prompt generated' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      direction,
      style,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Generate prompt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
