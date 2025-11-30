'use client';

import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // 可以在这里记录错误到日志服务
    console.error('页面错误:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 错误图标 */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-950/30 
              flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            出错了
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            页面加载时遇到了问题
          </p>
          {error.message && (
            <details className="text-left">
              <summary className="text-sm text-muted-foreground/80 cursor-pointer 
                hover:text-muted-foreground transition-colors">
                查看错误详情
              </summary>
              <div className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono 
                text-muted-foreground break-all">
                {error.message}
              </div>
            </details>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-foreground text-background rounded-lg
              hover:opacity-90 transition-opacity
              text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            重试
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              border border-border rounded-lg
              hover:bg-muted transition-colors
              text-sm font-medium text-foreground"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
