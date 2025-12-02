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
    // 同步 context 中的 URL 变化
    if (context.signedUrls[r2Key]) {
      setUrl(context.signedUrls[r2Key]);
    }
  }, [context.signedUrls, r2Key]);

  return url;
}

/**
 * 带自动刷新的 hook,用于图片等可以检测失效的资源
 * 注意: 仅适用于图片资源,音频/视频请使用 useR2Url + 手动 onError 处理
 */
export function useR2UrlWithRefresh(r2Key: string): { url: string | null; refresh: () => Promise<void> } {
  const context = useContext(R2UrlContext);
  
  if (!context) {
    console.warn('useR2UrlWithRefresh must be used within R2UrlProvider');
    return { url: null, refresh: async () => {} };
  }
  
  const url = useR2Url(r2Key);
  
  const refresh = async () => {
    await context.refreshUrl(r2Key);
  };

  return { url, refresh };
}
