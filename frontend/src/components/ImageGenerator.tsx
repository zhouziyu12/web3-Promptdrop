'use client';

import { useState } from 'react';
import { Loader2, Download, Eye, Sparkles } from 'lucide-react';

interface ImageGeneratorProps {
  prompt: string;
  onImageGenerated: (imageUrl: string, metadata: any) => void;
  isLoading?: boolean;
}

export function ImageGenerator({ prompt, onImageGenerated, isLoading = false }: ImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [imageMetadata, setImageMetadata] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('请先输入或生成prompt');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      console.log('开始生成图像...');
      
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
        onImageGenerated(data.imageUrl, data);
        console.log('图像生成成功:', data.imageUrl);
      } else {
        throw new Error(data.error || '图像生成失败');
      }
    } catch (error: any) {
      console.error('生成图像时出错:', error);
      setError(error.message || '图像生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;
    
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
      alert('下载失败，请重试');
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-200 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">山海神兽图像生成</h3>
      </div>

      {/* 当前prompt显示 */}
      {prompt && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">当前Prompt:</div>
          <div className="text-sm text-gray-800">{prompt}</div>
        </div>
      )}

      {/* 生成按钮 */}
      <button
        onClick={generateImage}
        disabled={!prompt.trim() || isGenerating || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium mb-4"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            AI正在创作神兽中...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            生成山海神兽图像
          </>
        )}
      </button>

      {/* 错误显示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 text-sm">⚠️ {error}</div>
        </div>
      )}

      {/* 生成的图像 */}
      {generatedImage && (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={generatedImage}
              alt="Generated Beast"
              className="w-full rounded-lg shadow-md"
              onError={() => setError('图像加载失败')}
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
                onClick={downloadImage}
                className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                title="下载图像"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 图像信息 */}
          {imageMetadata && (
            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div className="grid grid-cols-2 gap-2">
                <div>模型: CogView-3</div>
                <div>尺寸: {imageMetadata.size}</div>
                <div>风格: 山海经神话</div>
                <div>生成时间: {new Date().toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 使用智谱CogView-4模型生成山海经风格的神兽图像</p>
      </div>
    </div>
  );
}