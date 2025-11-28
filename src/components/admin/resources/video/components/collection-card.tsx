"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Video, HardDrive, Eye, Pencil, Trash2, ImageOff } from "lucide-react";
import type { VideoCollection } from "@/server/types/resources-type";
import { EditCollectionDialog } from "../dialogs/edit-collection-dialog";
import { DeleteCollectionDialog } from "../dialogs/delete-collection-dialog";

const styles = {
  card: `group hover:shadow-lg transition-shadow`.trim(),
  coverImageContainer: `w-full h-48 bg-muted rounded-md overflow-hidden mb-4 flex items-center justify-center`.trim(),
  coverImage: `w-full h-full object-cover`.trim(),
  noImagePlaceholder: `flex flex-col items-center justify-center text-muted-foreground gap-2`.trim(),
  noImageIcon: `h-12 w-12`.trim(),
  noImageText: `text-sm`.trim(),
  headerRow: `flex items-start justify-between`.trim(),
  headerContent: `flex-1`.trim(),
  title: `text-xl`.trim(),
  slug: `text-sm text-muted-foreground mt-1`.trim(),
  description: `text-sm text-muted-foreground line-clamp-2 mt-2`.trim(),
  tagsContainer: `flex flex-wrap gap-1 mt-3`.trim(),
  tag: `text-xs`.trim(),
  statsGrid: `grid grid-cols-2 gap-4`.trim(),
  statItem: `flex items-center gap-2 text-sm`.trim(),
  statIcon: `h-4 w-4 text-muted-foreground`.trim(),
  statText: `text-muted-foreground`.trim(),
  durationInfo: `mt-2 text-sm text-muted-foreground`.trim(),
  keywordsContainer: `flex flex-wrap gap-1 mt-4`.trim(),
  keyword: `text-xs`.trim(),
  footer: `flex gap-2 pb-4`.trim(),
  viewButton: `flex-1`.trim(),
  iconButton: `h-4 w-4`.trim(),
  deleteIcon: `h-4 w-4 text-destructive`.trim(),
};

interface CollectionCardProps {
  collection: VideoCollection;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算视频集总时长
  const totalDuration = collection.items?.reduce((sum, item) => sum + (item.duration || 0), 0) || 0;

  return (
    <>
      <Card className={styles.card}>
        <CardHeader>
          {/* 首页图 */}
          <div className={styles.coverImageContainer}>
            {collection.coverImage ? (
              <img 
                src={collection.coverImage} 
                alt={collection.title}
                className={styles.coverImage}
              />
            ) : (
              <div className={styles.noImagePlaceholder}>
                <ImageOff className={styles.noImageIcon} />
                <span className={styles.noImageText}>暂无图片</span>
              </div>
            )}
          </div>

          <div className={styles.headerRow}>
            <div className={styles.headerContent}>
              <CardTitle className={styles.title}>{collection.title}</CardTitle>
              <p className={styles.slug}>
                {collection.slug}
              </p>
            </div>
            {!collection.isPublic && (
              <Badge variant="secondary">私密</Badge>
            )}
          </div>
          {collection.description && (
            <p className={styles.description}>
              {collection.description}
            </p>
          )}

          {/* 关键词显示 */}
          {collection.keywords && collection.keywords.length > 0 && (
            <div className={styles.keywordsContainer}>
              {collection.keywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="outline" className={styles.keyword}>
                  {keyword}
                </Badge>
              ))}
              {collection.keywords.length > 5 && (
                <Badge variant="outline" className={styles.keyword}>
                  +{collection.keywords.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Video className={styles.statIcon} />
              <span className={styles.statText}>
                {collection.itemCount} 个视频
              </span>
            </div>
            <div className={styles.statItem}>
              <HardDrive className={styles.statIcon} />
              <span className={styles.statText}>
                {formatSize(collection.totalSize)}
              </span>
            </div>
          </div>
          {totalDuration > 0 && (
            <p className={styles.durationInfo}>
              总时长: {formatDuration(totalDuration)}
            </p>
          )}
        </CardContent>

        <CardFooter className={styles.footer}>
          <Link href={`/admin/dashboard/resources/video/${collection.id}`} className={styles.viewButton}>
            <Button variant="default" className="w-full">
              <Eye className={styles.iconButton} />
              查看视频
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className={styles.iconButton} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className={styles.deleteIcon} />
          </Button>
        </CardFooter>
      </Card>

      <EditCollectionDialog
        collection={collection}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteCollectionDialog
        collection={collection}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
