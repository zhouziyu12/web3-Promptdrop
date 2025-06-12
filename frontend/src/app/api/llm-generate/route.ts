import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      return NextResponse.json({ error: '缺少或无效的参数 prompt' }, { status: 400 });
    }

    const apiBase = 'https://api.deepseek.com/v1';

    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是AI艺术Prompt工程师。' },
          { role: 'user', content: prompt.trim() },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: errorText || '大模型接口错误' }, { status: response.status });
    }

    const data = await response.json();
    const resultPrompt = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ prompt: resultPrompt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || '服务器错误' }, { status: 500 });
  }
}
