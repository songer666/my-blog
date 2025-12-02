import { createPersistStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { R2CacheState, PersistMiddlewares } from "@/store/r2cache/type";
import { useShallow } from "zustand/react/shallow";

/**
 * 初始化状态
 */
const r2CacheCreator: StateCreator<R2CacheState, PersistMiddlewares, [], R2CacheState> = (set, get) => ({
  cache: {},

  getUrl: (r2Key: string) => {
    const state = get();
    const cached = state.cache[r2Key];
    
    if (!cached) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() > cached.expiresAt) {
      set((state) => {
        const newCache = { ...state.cache };
        delete newCache[r2Key];
        return { cache: newCache };
      }, false, 'r2cache/getUrl/expired');
      return null;
    }
    
    return cached.url;
  },

  setUrl: (r2Key: string, url: string, expiresAt: number) => {
    set((state) => ({
      cache: {
        ...state.cache,
        [r2Key]: { url, expiresAt },
      },
    }), false, 'r2cache/setUrl');
  },

  removeUrl: (r2Key: string) => {
    set((state) => {
      const newCache = { ...state.cache };
      delete newCache[r2Key];
      return { cache: newCache };
    }, false, 'r2cache/removeUrl');
  },

  clearExpired: () => {
    set((state) => {
      const now = Date.now();
      const newCache: Record<string, { url: string; expiresAt: number }> = {};
      
      Object.entries(state.cache).forEach(([key, value]) => {
        if (value.expiresAt > now) {
          newCache[key] = value;
        }
      });
      
      return { cache: newCache };
    }, false, 'r2cache/clearExpired');
  },

  clearAll: () => {
    set({
      cache: {},
    }, false, 'r2cache/clearAll');
  },

  getCacheStats: () => {
    const state = get();
    const now = Date.now();
    let totalCount = 0;
    let expiredCount = 0;
    let validCount = 0;

    Object.entries(state.cache).forEach(([key, value]) => {
      totalCount++;
      if (now > value.expiresAt) {
        expiredCount++;
      } else {
        validCount++;
      }
    });

    return {
      totalCount,
      expiredCount,
      validCount,
    };
  },

  limitCacheSize: (maxSize: number = 100) => {
    const state = get();
    const cacheEntries = Object.entries(state.cache);
    
    if (cacheEntries.length <= maxSize) {
      return;
    }
    
    // 按过期时间排序,保留最新的
    const sortedEntries = cacheEntries.sort((a, b) => b[1].expiresAt - a[1].expiresAt);
    const entriesToKeep = sortedEntries.slice(0, maxSize);
    
    const newCache: Record<string, { url: string; expiresAt: number }> = {};
    entriesToKeep.forEach(([key, value]) => {
      newCache[key] = value;
    });
    
    set({ cache: newCache }, false, 'r2cache/limitCacheSize');
  },
});

/**
 * 状态池创建函数 - 使用持久化存储
 */
export const r2CacheStore = createPersistStore<R2CacheState, R2CacheState>(
  r2CacheCreator,
  {
    name: 'blog-r2-cache',
    // 只持久化 cache 数据
    partialize: (state) => ({ 
      cache: state.cache,
      getUrl: state.getUrl,
      setUrl: state.setUrl,
      removeUrl: state.removeUrl,
      clearExpired: state.clearExpired,
      clearAll: state.clearAll,
      getCacheStats: state.getCacheStats,
      limitCacheSize: state.limitCacheSize,
    }),
  },
  { 
    name: 'r2-cache-store' 
  }
);

/**
 * 创建store的钩子函数
 */
export function useR2CacheStore<T>(selector: (state: R2CacheState) => T): T {
  return useStore(r2CacheStore, useShallow<R2CacheState, T>(selector));
}
