import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { UploadImageToGalleryDialog } from "@/components/admin/resources/image/upload-image-to-gallery-dialog";
import { BatchUploadImagesDialog } from "@/components/admin/resources/image/batch-upload-images-dialog";
import { GalleryViewContainer } from "@/components/admin/resources/image/gallery-view-container";
import { GalleryBreadcrumb } from "@/components/admin/resources/image/gallery-breadcrumb";
import styles from '../page.module.css';

interface GalleryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const gallery = await queryClient.fetchQuery(trpc.imageGallery.byId.queryOptions({ id }));

  if (!gallery) {
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

  return (
    <div className={styles.container}>
      {/* 设置面包屑 */}
      <GalleryBreadcrumb galleryName={gallery.title} />
      
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard/resources/image">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{gallery.title}</h1>
            {gallery.description && (
              <p className={styles.subtitle}>
                {gallery.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <BatchUploadImagesDialog galleryId={gallery.id} />
          <UploadImageToGalleryDialog galleryId={gallery.id} />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>图片数量</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{gallery.itemCount}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总大小</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{formatSize(gallery.totalSize)}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>状态</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{gallery.isPublic ? '公开' : '私密'}</p>
          </CardContent>
        </Card>

        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>标签</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{gallery.tags?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* 图片显示区域 */}
      <GalleryViewContainer gallery={gallery} />
    </div>
  );
}
