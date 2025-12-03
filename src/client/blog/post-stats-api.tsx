"use client";

import { useTRPC } from "@/components/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { postStatsConfig } from "@/lib/post-stats-config";

/**
 * 批量获取文章统计 Hook - 用于博客列表页（客户端）
 * 注意：详情页使用服务端组件 BlogStats
 */
export function usePostStatsForList(postIds: string[]) {
  const trpc = useTRPC();
  
  // 检查配置
  const isEnabled = postStatsConfig.enabled && 
    (process.env.NODE_ENV !== 'development' || postStatsConfig.enableInDev);
  
  // 批量获取统计（仅当启用时）
  const { data: statsData, isLoading } = useQuery({
    ...trpc.postStats.getStatsBatch.queryOptions({ postIds }),
    enabled: isEnabled && postIds.length > 0,
  });

  // 创建 postId -> viewCount 的映射
  const statsMap = new Map<string, number>();
  if (statsData?.data) {
    statsData.data.forEach((stat) => {
      statsMap.set(stat.postId, stat.viewCount);
    });
  }

  return {
    getViewCount: (postId: string) => statsMap.get(postId) ?? 0,
    isLoading,
    isEnabled,
    showViewCount: postStatsConfig.showViewCount,
  };
}
