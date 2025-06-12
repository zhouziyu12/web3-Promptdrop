import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/providers/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '神图计划 ShanHaiVerse - AI驱动的山海经神兽创作平台',
  description: '使用AI生成山海经风格的神兽图像，铸造成独特的NFT收藏品。让千年神话在Web3时代重新绽放光芒。',
  keywords: ['NFT', 'AI', '山海经', '神兽', 'Web3', 'CogView-4', '区块链'],
  authors: [{ name: 'ShanHaiVerse Team' }],
  openGraph: {
    title: '神图计划 ShanHaiVerse',
    description: 'AI驱动的山海经神兽创作平台',
    type: 'website',
    locale: 'zh_CN',
  },
  twitter: {
    card: 'summary_large_image',
    title: '神图计划 ShanHaiVerse',
    description: 'AI驱动的山海经神兽创作平台',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  );
}