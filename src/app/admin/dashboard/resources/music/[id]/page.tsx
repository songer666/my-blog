import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MusicPlayerWithTable } from "@/components/admin/resources/music/music-player-with-table";
import { UploadMusicDialog } from "@/components/admin/resources/music/upload-music-dialog";
import { MusicUploadTasks } from "@/components/admin/resources/music/music-upload-tasks";
import { AlbumBreadcrumb } from "@/components/admin/resources/music/album-breadcrumb";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { ArrowLeft, Music2, HardDrive } from "lucide-react";
import styles from '../page.module.css';
import { RevalidateButton } from "@/components/isr";

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>;
}

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const album = await queryClient.fetchQuery(trpc.musicAlbum.byId.queryOptions({ id }));

  if (!album) {
    notFound();
  }

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = album.items?.reduce((sum: number, item) => sum + (item.duration || 0), 0) || 0;

  return (
    <div className={styles.container}>
      {/* 设置面包屑 */}
      <AlbumBreadcrumb albumName={album.title} />
      
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard/resources/music">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{album.title}</h1>
            {album.description && (
              <p className={styles.subtitle}>
                {album.description}
              </p>
            )}
            {/* 标签 */}
            {album.tags && album.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {album.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <RevalidateButton 
            type="music-detail" 
            slug={album.slug}
            label="刷新当前页面"
            size="sm"
          />
          <UploadMusicDialog albumId={album.id} />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>音乐数量</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{album.itemCount}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总大小</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{formatSize(album.totalSize)}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总时长</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>
              {totalDuration > 0 ? formatDuration(totalDuration) : '0:00'}
            </p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>状态</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{album.isPublic ? '公开' : '私密'}</p>
          </CardContent>
        </Card>
      </div>

      {/* 上传任务列表 */}
      <MusicUploadTasks albumId={album.id} />

      {/* 音乐播放器 + 列表 */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">音乐列表</h2>
        <MusicPlayerWithTable 
          musics={album.items || []} 
          albumId={album.id} 
        />
      </div>
    </div>
  );
}
