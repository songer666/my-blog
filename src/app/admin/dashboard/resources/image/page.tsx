import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { ImageGalleryList } from "@/server/types/resources-type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { CreateGalleryDialog } from "@/components/admin/resources/image/dialogs/create-gallery-dialog";
import { GalleryList } from "@/components/admin/resources/image/gallery-list";
import styles from './page.module.css';
import { RevalidateButton } from "@/components/isr";

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function ImageGalleryPage() {
  const queryClient = getQueryClient();
  const galleries: ImageGalleryList = await queryClient.fetchQuery(trpc.imageGallery.all.queryOptions());
  
  // 统计数据
  const totalGalleries = galleries.length;
  const totalImages = galleries.reduce((sum, gallery) => sum + gallery.itemCount, 0);
  const totalSize = galleries.reduce((sum, gallery) => sum + gallery.totalSize, 0);
  const publicGalleries = galleries.filter(g => g.isPublic).length;

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
          <h1 className={styles.title}>图库管理</h1>
          <p className={styles.subtitle}>
            管理和组织你的图库资源
          </p>
        </div>
        <div className="flex gap-2">
          <RevalidateButton type="image" label="刷新图库页面" size="sm" />
          <CreateGalleryDialog />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>图库数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{totalGalleries}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总图片数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{totalImages}</p>
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
            <CardTitle className={styles.statTitle}>公开图库</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{publicGalleries}</p>
          </CardContent>
        </Card>
      </div>

      {/* 图库列表 */}
      <GalleryList galleries={galleries} />
    </div>
  );
}