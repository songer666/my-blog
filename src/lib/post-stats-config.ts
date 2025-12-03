// src/lib/post-stats-config.ts
/**
 * 博客访问统计配置
 * 
 * 可在此文件中配置统计功能的开关和参数
 * 修改后需要重新发布才能生效
 */

export const postStatsConfig = {
  /**
   * 是否启用访问统计功能
   * - true: 启用统计，会显示访问量图标和数字
   * - false: 禁用统计，不显示任何统计相关的UI
   */
  enabled: false,

  /**
   * IP 缓存时长（毫秒）
   * 同一 IP 在此时间内重复访问同一篇文章不会重复计数
   * 默认: 24小时 = 24 * 60 * 60 * 1000 = 86400000
   */
  ipCacheDuration: 24 * 60 * 60 * 1000,

  /**
   * 本地缓存存储键名
   */
  cacheStoreName: 'blog-post-stats-cache',

  /**
   * 最大缓存条目数
   * 防止缓存无限增长
   */
  maxCacheEntries: 500,

  /**
   * 是否在开发环境下记录统计
   * - true: 开发环境也记录
   * - false: 仅生产环境记录
   */
  enableInDev: false,

  /**
   * 是否显示访问量数字
   * - true: 显示具体数字（如 "123 次访问"）
   * - false: 只显示图标
   */
  showViewCount: true,
} as const;

/**
 * 获取统计配置
 */
export function getPostStatsConfig() {
  return postStatsConfig;
}

/**
 * 判断统计功能是否启用
 */
export function isStatsEnabled(): boolean {
  const config = getPostStatsConfig();
  
  // 如果配置禁用，直接返回 false
  if (!config.enabled) {
    return false;
  }
  
  // 检查是否在开发环境且禁用了开发环境统计
  if (process.env.NODE_ENV === 'development' && !config.enableInDev) {
    return false;
  }
  
  return true;
}

/**
 * 获取 IP 缓存时长
 */
export function getIpCacheDuration(): number {
  return getPostStatsConfig().ipCacheDuration;
}

/**
 * 计算缓存过期时间戳
 */
export function calculateCacheExpiry(): number {
  return Date.now() + getIpCacheDuration();
}

/**
 * 检查缓存是否过期
 */
export function isCacheExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}
