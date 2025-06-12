'use client';

import { useEffect, useState } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

/**
 * 科学防 SSR 报错写法，页面绝无水合警告
 */
export function ConnectWallet() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address, query: { enabled: !!address } });

  // 组件挂载后再渲染（保证只在客户端渲染钱包数据）
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // SSR 阶段直接不渲染任何与钱包相关的内容
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <ConnectButton />
      {isConnected && address && (
        <div className="p-4 bg-gray-100 rounded-lg mt-2">
          <div className="text-sm text-gray-600">Connected Address:</div>
          <div className="font-mono text-sm break-all">{address}</div>
          {balance && (
            <div className="text-sm text-gray-600 mt-2">
              Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
