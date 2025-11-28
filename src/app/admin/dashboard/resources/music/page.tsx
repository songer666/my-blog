import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { MusicAlbumList } from "@/server/types/resources-type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { CreateAlbumDialog } from "@/components/admin/resources/music/dialogs/create-album-dialog";
import { AlbumList } from "@/components/admin/resources/music/album-list";
import styles from './page.module.css';

export default async function MusicAlbumPage() {
  const queryClient = getQueryClient();
  const albums: MusicAlbumList = await queryClient.fetchQuery(trpc.musicAlbum.all.queryOptions());
  
  // 统计数据
  const totalAlbums = albums.length;
  const totalMusic = albums.reduce((sum, album) => sum + album.itemCount, 0);
  const totalSize = albums.reduce((sum, album) => sum + album.totalSize, 0);
  const publicAlbums = albums.filter(a => a.isPublic).length;

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>音乐专辑管理</h1>
          <p className={styles.subtitle}>
            管理和组织你的音乐资源
          </p>
        </div>
        <CreateAlbumDialog />
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>专辑数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{totalAlbums}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总音乐数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{totalMusic}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总大小</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{formatSize(totalSize)}</p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>公开专辑</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{publicAlbums}</p>
          </CardContent>
        </Card>
      </div>

      {/* 专辑列表 */}
      <AlbumList albums={albums} />
    </div>
  );
}