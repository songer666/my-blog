import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { StatsCard } from "@/components/admin/main/stats-card";
import { ActivityChart, ResourceDistribution } from "@/components/admin/main/activity-chart";
import { RecentPosts } from "@/components/admin/main/recent-posts";
import { RecentMessages } from "@/components/admin/main/recent-messages";
import {
  FileText,
  MessageSquare,
  Image,
  Music,
  Video,
  Code,
  Users,
  Eye,
} from "lucide-react";

// Admin 页面需要认证，不能使用 force-static
// 保持动态渲染以支持用户认证和权限检查

export default async function DashboardPage() {
  const queryClient = getQueryClient();
  
  // 并行获取所有数据
  const [
    postsResponse,
    messages,
    galleries,
    musicAlbums,
    videoCollections,
    codeRepositories,
    users,
  ] = await Promise.all([
    queryClient.fetchQuery(trpc.post.getAll.queryOptions()),
    queryClient.fetchQuery(trpc.message.all.queryOptions()),
    queryClient.fetchQuery(trpc.imageGallery.all.queryOptions()),
    queryClient.fetchQuery(trpc.musicAlbum.all.queryOptions()),
    queryClient.fetchQuery(trpc.videoCollection.all.queryOptions()),
    queryClient.fetchQuery(trpc.codeRepository.all.queryOptions()),
    queryClient.fetchQuery(trpc.auth.all.queryOptions()),
  ]);

  // 解构 post 数据
  const posts = postsResponse.data || [];

  // 计算统计数据
  const totalPosts = posts.length;
  const visiblePosts = posts.filter((p) => p.visible).length;
  const totalMessages = messages.length;
  const unreadMessages = messages.filter((m) => !m.isRead).length;
  const totalGalleries = galleries.length;
  const totalImages = galleries.reduce((sum, g) => sum + (g.itemCount || 0), 0);
  const totalMusicAlbums = musicAlbums.length;
  const totalMusics = musicAlbums.reduce((sum, a) => sum + (a.itemCount || 0), 0);
  const totalVideoCollections = videoCollections.length;
  const totalVideos = videoCollections.reduce((sum, c) => sum + (c.itemCount || 0), 0);
  const totalCodeRepositories = codeRepositories.length;
  const totalUsers = users.length;

  // 最近 7 天活动数据（模拟）
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }),
      posts: Math.floor(Math.random() * 5),
      messages: Math.floor(Math.random() * 10),
    };
  });

  // 资源分布数据
  const resourceData = [
    { name: "图片", count: totalImages, fill: "hsl(var(--chart-1))" },
    { name: "音乐", count: totalMusics, fill: "hsl(var(--chart-2))" },
    { name: "视频", count: totalVideos, fill: "hsl(var(--chart-3))" },
    { name: "代码", count: totalCodeRepositories, fill: "hsl(var(--chart-4))" },
  ];

  // 最近文章（取前 5 篇）
  const recentPosts = posts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // 最近消息（取前 5 条）
  const recentMessages = messages
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面头部 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="text-muted-foreground">
          欢迎回来，这是你的系统概览
        </p>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="文章总数"
          value={totalPosts}
          description={`${visiblePosts} 篇公开`}
          icon={FileText}
        />
        <StatsCard
          title="消息总数"
          value={totalMessages}
          description={`${unreadMessages} 条未读`}
          icon={MessageSquare}
        />
        <StatsCard
          title="图片总数"
          value={totalImages}
          description={`${totalGalleries} 个图库`}
          icon={Image}
        />
        <StatsCard
          title="用户总数"
          value={totalUsers}
          description="注册用户"
          icon={Users}
        />
      </div>

      {/* 资源统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="音乐总数"
          value={totalMusics}
          description={`${totalMusicAlbums} 个专辑`}
          icon={Music}
        />
        <StatsCard
          title="视频总数"
          value={totalVideos}
          description={`${totalVideoCollections} 个集合`}
          icon={Video}
        />
        <StatsCard
          title="代码库"
          value={totalCodeRepositories}
          description="代码仓库"
          icon={Code}
        />
        <StatsCard
          title="公开文章"
          value={visiblePosts}
          description={`${((visiblePosts / totalPosts) * 100).toFixed(0)}% 可见`}
          icon={Eye}
        />
      </div>

      {/* 图表区域 */}
      <div className="grid gap-4 md:grid-cols-2">
        <ActivityChart data={activityData} description="最近 7 天的内容活动" />
        <ResourceDistribution data={resourceData} description="各类资源数量分布" />
      </div>

      {/* 最近内容 */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecentPosts posts={recentPosts} />
        <RecentMessages messages={recentMessages} />
      </div>
    </div>
  );
}
