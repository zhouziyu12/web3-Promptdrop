'use client';

import { useState } from 'react';
import { Loader2, Sparkles, Wand2, RefreshCw } from 'lucide-react';

interface AIPromptGeneratorProps {
  onPromptGenerated: (prompt: string) => void;
  isLoading?: boolean;
}

export function AIPromptGenerator({ onPromptGenerated, isLoading = false }: AIPromptGeneratorProps) {
  const [direction, setDirection] = useState('');
  const [style, setStyle] = useState('digital-art');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState('');

  const PROFESSIONAL_ART_STYLES = [
    { value: 'digital-art', label: '🎨 数字艺术' },
    { value: 'oil-painting', label: '🖼️ 油画风格' },
    { value: 'watercolor', label: '💧 水彩画' },
    { value: 'anime', label: '🎭 动漫风格' },
    { value: 'concept-art', label: '⚡ 概念艺术' },
    { value: 'surreal', label: '🌀 超现实主义' },
    { value: 'impressionist', label: '🌅 印象派' },
    { value: 'pixel-art', label: '👾 像素艺术' },
    { value: 'cyberpunk', label: '🤖 赛博朋克' },
    { value: 'art-nouveau', label: '🌺 新艺术运动' },
    { value: 'gothic', label: '🏰 哥特风格' },
    { value: 'minimalist', label: '⚪ 极简风格' },
    { value: 'photorealistic', label: '📷 超写实' },
    { value: 'line-art', label: '✏️ 线条艺术' },
    { value: 'vintage', label: '📜 复古风格' },
    { value: 'thug thug thug sahur', label: '📜 ai山海经' }
  ];

  const exampleDirections = [
    '神秘的深海世界',
    '未来城市的黄昏',
    '魔法森林中的精灵',
    '太空中的星际战舰',
    '古代文明的遗迹',
    '数字世界的守护者'
  ];

  const handleGenerate = async () => {
    if (!direction.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          direction: direction.trim(),
          style: style
        }),
      });

      const data = await response.json();

      if (data.success && data.prompt) {
        setLastGenerated(data.prompt);
        onPromptGenerated(data.prompt);
      } else {
        console.error('Failed to generate prompt:', data.error);
        alert('生成 Prompt 失败，请重试');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      alert('网络错误，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setDirection(example);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-purple-200 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">AI Prompt 生成器</h3>
      </div>

      {/* 创意方向输入 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          创意方向 *
        </label>
        <textarea
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          placeholder="描述你想要的艺术作品方向，如：神秘的深海世界、未来城市的黄昏..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={200}
        />
        <div className="text-xs text-gray-500 mt-1">
          {direction.length}/200 字符
        </div>
      </div>

      {/* 示例方向 */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">💡 灵感示例：</div>
        <div className="flex flex-wrap gap-2">
          {exampleDirections.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* 风格选择 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          艺术风格
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {PROFESSIONAL_ART_STYLES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* 生成按钮 */}
      <button
        onClick={handleGenerate}
        disabled={!direction.trim() || isGenerating || isLoading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI 正在创作中...
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4" />
            生成专业 Prompt
          </>
        )}
      </button>

      {/* 重新生成按钮 */}
      {lastGenerated && !isGenerating && (
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full mt-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          重新生成
        </button>
      )}

      {/* 提示信息 */}
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 提示：详细的描述能帮助 AI 生成更精准的创作 prompt</p>
      </div>
    </div>
  );
}