/**
 * 缓存的访问记录
 */
export type CachedView = {
  postId: string;
  expiresAt: number; // 过期时间戳
};

/**
 * 访问统计缓存数据类型
 */
export type PostStatsCacheData = {
  // postId_ip -> CachedView
  viewedPosts: Record<string, CachedView>;
};

/**
 * 访问统计缓存动作
 */
export type PostStatsCacheAction = {
  /**
   * 检查是否已访问过该文章（在缓存期内）
   */
  hasViewed: (postId: string) => boolean;

  /**
   * 标记文章为已访问
   */
  markViewed: (postId: string) => void;

  /**
   * 清除过期缓存
   */
  clearExpired: () => void;

  /**
   * 清空所有缓存
   */
  clearAll: () => void;

  /**
   * 获取缓存统计信息
   */
  getCacheStats: () => {
    totalCount: number;
    expiredCount: number;
    validCount: number;
  };

  /**
   * 限制缓存大小
   */
  limitCacheSize: (maxSize?: number) => void;
};

/**
 * 访问统计缓存整体状态类型
 */
export type PostStatsCacheState = PostStatsCacheData & PostStatsCacheAction;

/**
 * zustand持久化中间件类型
 */
export type PersistMiddlewares = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
  ['zustand/devtools', never],
  ['zustand/persist', PostStatsCacheState],
];
