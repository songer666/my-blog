'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* 猫咪图片 */}
        <div className="flex justify-center">
          <div className="relative w-48 h-48 sm:w-64 sm:h-64">
            <Image
              src="/notfound/not-found.png"
              alt="404 - 页面未找到"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* 404 文字 */}
        <div className="space-y-3">
          <h1 className="text-6xl sm:text-7xl font-bold text-foreground">
            404
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            页面走丢了
          </p>
          <p className="text-sm text-muted-foreground/80">
            页面不存在哟
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              bg-foreground text-background rounded-lg
              hover:opacity-90 transition-opacity
              text-sm font-medium"
          >
            <Home className="w-4 h-4" />
            返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 
              border border-border rounded-lg
              hover:bg-muted transition-colors
              text-sm font-medium text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
