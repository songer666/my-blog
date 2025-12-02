/**
 * 缓存的 URL 信息
 */
export type CachedUrl = {
  url: string;
  expiresAt: number; // 过期时间戳
}

/**
 * R2 URL 缓存数据类型
 */
export type R2CacheData = {
  cache: Record<string, CachedUrl>; // r2Key -> CachedUrl
}

/**
 * 缓存统计信息
 */
export type CacheStats = {
  totalCount: number; // 总缓存数量
  expiredCount: number; // 过期缓存数量
  validCount: number; // 有效缓存数量
}

/**
 * R2 URL 缓存动作
 */
export type R2CacheAction = {
  getUrl: (r2Key: string) => string | null; // 获取缓存的 URL
  setUrl: (r2Key: string, url: string, expiresAt: number) => void; // 设置缓存
  removeUrl: (r2Key: string) => void; // 移除缓存
  clearExpired: () => void; // 清除过期缓存
  clearAll: () => void; // 清空所有缓存
  getCacheStats: () => CacheStats; // 获取缓存统计信息
  limitCacheSize: (maxSize?: number) => void; // 限制缓存数量
}

/**
 * R2 URL 缓存整体状态类型
 */
export type R2CacheState = R2CacheData & R2CacheAction

/**
 * zustand持久化中间件类型
 */
export type PersistMiddlewares =
  [
    ['zustand/subscribeWithSelector', never],
    ['zustand/immer', never],
    ['zustand/devtools', never],
    ['zustand/persist', R2CacheState],
  ];
