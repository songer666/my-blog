import { postStatsConfig } from "@/lib/post-stats-config";
import { BlogStatsClient } from "./blog-stats-client";
import { TRPCReactProvider } from "@/components/trpc/client";

interface BlogStatsProps {
  postId: string;
  className?: string;
}

/**
 * 博客统计组件 - 服务端入口
 * 检查配置后渲染客户端组件
 */
export function BlogStats({ postId, className }: BlogStatsProps) {
  // 服务端检查配置，如果禁用直接不渲染
  if (!postStatsConfig.enabled) {
    return null;
  }

  // 开发环境且禁用开发环境统计
  if (process.env.NODE_ENV === 'development' && !postStatsConfig.enableInDev) {
    return null;
  }

  // 渲染客户端组件，动态获取和显示统计
  return (
    <TRPCReactProvider>
      <BlogStatsClient 
        postId={postId} 
        className={className}
        showViewCount={postStatsConfig.showViewCount}
      />
    </TRPCReactProvider>
  );
}
