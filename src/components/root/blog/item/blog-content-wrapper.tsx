'use client';

import React, { useState, useEffect } from 'react';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';
import { MdxContentSkeleton } from '@/components/skeleton/mdx-skeleton';

interface BlogContentWrapperProps {
  children: React.ReactNode;
  signedUrls: Record<string, string>;
}

export function BlogContentWrapper({ children, signedUrls }: BlogContentWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 模拟内容加载完成
    setIsLoaded(true);
  }, []);

  return (
    <R2UrlProvider signedUrls={signedUrls}>
      {!isLoaded ? (
        <MdxContentSkeleton />
      ) : (
        children
      )}
    </R2UrlProvider>
  );
}
