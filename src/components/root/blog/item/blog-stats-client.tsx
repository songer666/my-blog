"use client";

import { useEffect, useCallback, useRef } from "react";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePostStatsCacheStore } from "@/store/postStats/store";
import { useTRPC } from "@/components/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface BlogStatsClientProps {
  postId: string;
  className?: string;
  showViewCount: boolean;
}

/**
 * 博客统计客户端组件
 * 使用 TRPC 动态获取统计数据并记录访问
 */
export function BlogStatsClient({ postId, className, showViewCount }: BlogStatsClientProps) {
  const hasTracked = useRef(false);
  const trpc = useTRPC();
  
  // Zustand store
  const hasViewed = usePostStatsCacheStore((state) => state.hasViewed);
  const markViewed = usePostStatsCacheStore((state) => state.markViewed);
  const clearExpired = usePostStatsCacheStore((state) => state.clearExpired);
  const limitCacheSize = usePostStatsCacheStore((state) => state.limitCacheSize);

  // 获取统计数据
  const { data: statsData, isLoading } = useQuery(
    trpc.postStats.getStats.queryOptions({ postId })
  );

  // 记录访问 mutation
  const recordViewMutation = useMutation(
    trpc.postStats.recordView.mutationOptions()
  );

  // 记录访问
  const trackView = useCallback(async () => {
    // 防止重复调用
    if (hasTracked.current) {
      return;
    }

    // 检查本地缓存，防止重复请求
    if (hasViewed(postId)) {
      return;
    }

    hasTracked.current = true;

    try {
      // 清理过期缓存
      clearExpired();
      // 限制缓存大小
      limitCacheSize();

      // 获取 userAgent
      const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : undefined;

      // 调用 TRPC 记录访问
      await recordViewMutation.mutateAsync({ postId, userAgent });

      // 标记本地缓存防止重复请求
      markViewed(postId);
    } catch (error) {
      console.error("记录访问失败:", error);
      hasTracked.current = false;
    }
  }, [postId, hasViewed, markViewed, clearExpired, limitCacheSize, recordViewMutation]);

  // 组件挂载时记录访问
  useEffect(() => {
    trackView();
  }, [trackView]);

  const viewCount = statsData?.data?.viewCount ?? 0;

  // 加载中显示骨架
  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-1 text-muted-foreground text-sm",
          className
        )}
      >
        <Eye className="w-4 h-4" />
        {showViewCount && <span className="w-6 h-4 bg-muted animate-pulse rounded" />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-muted-foreground text-sm",
        className
      )}
    >
      <Eye className="w-4 h-4" />
      {showViewCount && <span>{viewCount}</span>}
    </div>
  );
}
