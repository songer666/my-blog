'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { getSignedUrlAction } from '@/server/actions/resources/r2-action';
import { useR2CacheStore } from '@/store/r2cache/store';
import { R2_CACHE_DURATION, R2_CACHE_MAX_SIZE } from '@/lib/r2-utils';

interface R2UrlContextType {
  signedUrls: Record<string, string>;
  refreshUrl: (r2Key: string) => Promise<void>;
  getUrlWithCache: (r2Key: string) => Promise<string | null>;
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
  
  // 使用 Zustand store
  const getCachedUrl = useR2CacheStore(state => state.getUrl);
  const setCachedUrl = useR2CacheStore(state => state.setUrl);
  const clearExpired = useR2CacheStore(state => state.clearExpired);
  const limitCacheSize = useR2CacheStore(state => state.limitCacheSize);
  const getCacheStats = useR2CacheStore(state => state.getCacheStats);

  // 初始化时清理过期缓存并限制缓存数量
  useEffect(() => {
    const stats = getCacheStats();
    
    // 清理过期缓存
    if (stats.expiredCount > 0) {
      clearExpired();
    }
    
    // 限制缓存数量
    limitCacheSize(R2_CACHE_MAX_SIZE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在组件挂载时执行一次

  // 获取 URL (优先使用缓存)
  const getUrlWithCache = async (r2Key: string): Promise<string | null> => {
    // 1. 检查内存中的 URL
    if (signedUrls[r2Key]) {
      return signedUrls[r2Key];
    }
    
    // 2. 检查 Zustand 缓存
    const cachedUrl = getCachedUrl(r2Key);
    if (cachedUrl) {
      // 更新到内存
      setSignedUrls(prev => ({
        ...prev,
        [r2Key]: cachedUrl,
      }));
      return cachedUrl;
    }
    
    // 3. 缓存未命中,请求新的签名 URL
    try {
      const result = await getSignedUrlAction(r2Key);
      if (result.success && result.signedUrl) {
        const newUrl = result.signedUrl as string;
        const expiresAt = Date.now() + R2_CACHE_DURATION;
        
        // 保存到内存和缓存
        setSignedUrls(prev => ({
          ...prev,
          [r2Key]: newUrl,
        }));
        setCachedUrl(r2Key, newUrl, expiresAt);
        
        return newUrl;
      }
    } catch (error) {
      // 静默处理错误
    }
    
    return null;
  };

  // 刷新 URL (强制重新获取)
  const refreshUrl = async (r2Key: string) => {
    try {
      const result = await getSignedUrlAction(r2Key);
      if (result.success && result.signedUrl) {
        const newUrl = result.signedUrl as string;
        const expiresAt = Date.now() + R2_CACHE_DURATION;
        
        // 更新内存和缓存
        setSignedUrls(prev => ({
          ...prev,
          [r2Key]: newUrl,
        }));
        setCachedUrl(r2Key, newUrl, expiresAt);
      }
    } catch (error) {
      // 静默处理错误
    }
  };

  return (
    <R2UrlContext.Provider value={{ signedUrls, refreshUrl, getUrlWithCache }}>
      {children}
    </R2UrlContext.Provider>
  );
}

export function useR2Url(r2Key: string): string | null {
  const context = useContext(R2UrlContext);
  
  if (!context) {
    return null;
  }
  
  const [url, setUrl] = useState<string | null>(context.signedUrls[r2Key] || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 同步 context 中的 URL 变化
    if (context.signedUrls[r2Key]) {
      setUrl(context.signedUrls[r2Key]);
      return;
    }
    
    // 如果内存中没有,尝试从缓存获取
    if (!url && !isLoading) {
      setIsLoading(true);
      context.getUrlWithCache(r2Key).then(cachedUrl => {
        if (cachedUrl) {
          setUrl(cachedUrl);
        }
        setIsLoading(false);
      });
    }
  }, [context, r2Key, url, isLoading]);

  return url;
}

/**
 * 带自动刷新的 hook,用于图片等可以检测失效的资源
 * 注意: 仅适用于图片资源,音频/视频请使用 useR2Url + 手动 onError 处理
 */
export function useR2UrlWithRefresh(r2Key: string): { url: string | null; refresh: () => Promise<void> } {
  const context = useContext(R2UrlContext);
  
  if (!context) {
    return { url: null, refresh: async () => {} };
  }
  
  const url = useR2Url(r2Key);
  
  const refresh = async () => {
    await context.refreshUrl(r2Key);
  };

  return { url, refresh };
}
