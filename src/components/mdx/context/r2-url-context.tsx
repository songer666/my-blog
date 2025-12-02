'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getSignedUrlAction } from '@/server/actions/resources/r2-action';

interface R2UrlContextType {
  signedUrls: Record<string, string>;
  refreshUrl: (r2Key: string) => Promise<void>;
}

const R2UrlContext = createContext<R2UrlContextType | undefined>(undefined);

export function R2UrlProvider({ 
  children, 
  signedUrls: initialUrls 
}: { 
  children: ReactNode; 
  signedUrls: Record<string, string>;
}) {
  const [signedUrls, setSignedUrls] = useState(initialUrls);

  const refreshUrl = async (r2Key: string) => {
    try {
      const result = await getSignedUrlAction(r2Key);
      if (result.success && result.signedUrl) {
        setSignedUrls(prev => ({
          ...prev,
          [r2Key]: result.signedUrl as string,
        }));
      }
    } catch (error) {
      console.error('刷新签名URL失败:', error);
    }
  };

  return (
    <R2UrlContext.Provider value={{ signedUrls, refreshUrl }}>
      {children}
    </R2UrlContext.Provider>
  );
}

export function useR2Url(r2Key: string): string | null {
  const context = useContext(R2UrlContext);
  
  if (!context) {
    console.warn('useR2Url must be used within R2UrlProvider');
    return null;
  }
  
  const [url, setUrl] = useState(context.signedUrls[r2Key] || null);

  useEffect(() => {
    // 如果初始 URL 存在，使用它
    if (context.signedUrls[r2Key]) {
      setUrl(context.signedUrls[r2Key]);
    }
  }, [context.signedUrls, r2Key]);

  // 检测 URL 是否失效，如果失效则自动刷新
  useEffect(() => {
    if (!url) return;

    const checkAndRefresh = async () => {
      try {
        // 尝试加载图片，检测是否失效
        const img = new Image();
        img.onerror = async () => {
          console.log(`URL 失效，自动刷新: ${r2Key}`);
          await context.refreshUrl(r2Key);
          // 刷新后更新 URL
          const newUrl = context.signedUrls[r2Key];
          if (newUrl) {
            setUrl(newUrl);
          }
        };
        img.src = url;
      } catch (error) {
        console.error('检测 URL 失效失败:', error);
      }
    };

    checkAndRefresh();
  }, [url, r2Key, context]);

  return url;
}
