import { createPersistStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { PostStatsCacheState, PersistMiddlewares } from "@/store/postStats/type";
import { useShallow } from "zustand/react/shallow";
import { postStatsConfig } from "@/lib/post-stats-config";

/**
 * 初始化状态
 */
const postStatsCacheCreator: StateCreator<
  PostStatsCacheState,
  PersistMiddlewares,
  [],
  PostStatsCacheState
> = (set, get) => ({
  viewedPosts: {},

  hasViewed: (postId: string) => {
    const state = get();
    const cached = state.viewedPosts[postId];

    if (!cached) {
      return false;
    }

    // 检查是否过期
    if (Date.now() > cached.expiresAt) {
      set(
        (state) => {
          const newCache = { ...state.viewedPosts };
          delete newCache[postId];
          return { viewedPosts: newCache };
        },
        false,
        "postStats/hasViewed/expired"
      );
      return false;
    }

    return true;
  },

  markViewed: (postId: string) => {
    const expiresAt = Date.now() + postStatsConfig.ipCacheDuration;

    set(
      (state) => ({
        viewedPosts: {
          ...state.viewedPosts,
          [postId]: { postId, expiresAt },
        },
      }),
      false,
      "postStats/markViewed"
    );
  },

  clearExpired: () => {
    set(
      (state) => {
        const now = Date.now();
        const newCache: Record<string, { postId: string; expiresAt: number }> = {};

        Object.entries(state.viewedPosts).forEach(([key, value]) => {
          if (value.expiresAt > now) {
            newCache[key] = value;
          }
        });

        return { viewedPosts: newCache };
      },
      false,
      "postStats/clearExpired"
    );
  },

  clearAll: () => {
    set({ viewedPosts: {} }, false, "postStats/clearAll");
  },

  getCacheStats: () => {
    const state = get();
    const now = Date.now();
    let totalCount = 0;
    let expiredCount = 0;
    let validCount = 0;

    Object.entries(state.viewedPosts).forEach(([key, value]) => {
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

  limitCacheSize: (maxSize: number = postStatsConfig.maxCacheEntries) => {
    const state = get();
    const cacheEntries = Object.entries(state.viewedPosts);

    if (cacheEntries.length <= maxSize) {
      return;
    }

    // 按过期时间排序，保留最新的
    const sortedEntries = cacheEntries.sort(
      (a, b) => b[1].expiresAt - a[1].expiresAt
    );
    const entriesToKeep = sortedEntries.slice(0, maxSize);

    const newCache: Record<string, { postId: string; expiresAt: number }> = {};
    entriesToKeep.forEach(([key, value]) => {
      newCache[key] = value;
    });

    set({ viewedPosts: newCache }, false, "postStats/limitCacheSize");
  },
});

/**
 * 状态池创建函数 - 使用持久化存储
 */
export const postStatsCacheStore = createPersistStore<
  PostStatsCacheState,
  PostStatsCacheState
>(
  postStatsCacheCreator,
  {
    name: postStatsConfig.cacheStoreName,
    partialize: (state) => ({
      viewedPosts: state.viewedPosts,
      hasViewed: state.hasViewed,
      markViewed: state.markViewed,
      clearExpired: state.clearExpired,
      clearAll: state.clearAll,
      getCacheStats: state.getCacheStats,
      limitCacheSize: state.limitCacheSize,
    }),
  },
  {
    name: "post-stats-cache-store",
  }
);

/**
 * 创建 store 的钩子函数
 */
export function usePostStatsCacheStore<T>(
  selector: (state: PostStatsCacheState) => T
): T {
  return useStore(postStatsCacheStore, useShallow<PostStatsCacheState, T>(selector));
}
