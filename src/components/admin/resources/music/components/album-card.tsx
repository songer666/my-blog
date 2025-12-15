"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Music2, HardDrive, Eye, Pencil, Trash2, ImageOff } from "lucide-react";
import type { MusicAlbumList } from "@/server/types/resources-type";
import { EditAlbumDialog } from "../dialogs/edit-album-dialog";
import { DeleteAlbumDialog } from "../dialogs/delete-album-dialog";

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

interface AlbumCardProps {
  album: MusicAlbumList[number];
}

export function AlbumCard({ album }: AlbumCardProps) {
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

  return (
    <>
      <Card className={styles.card}>
        <CardHeader>
          {/* 首页图 */}
          <div className={styles.coverImageContainer}>
            {album.coverImage ? (
              <img 
                src={album.coverImage} 
                alt={album.title}
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
              <CardTitle className={styles.title}>{album.title}</CardTitle>
              <p className={styles.slug}>
                {album.slug}
              </p>
            </div>
            {!album.isPublic && (
              <Badge variant="secondary">私密</Badge>
            )}
          </div>
          {album.description && (
            <p className={styles.description}>
              {album.description}
            </p>
          )}

          {/* 标签显示 */}
          {album.tags && album.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {album.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className={styles.tag}>
                  {tag}
                </Badge>
              ))}
              {album.tags.length > 5 && (
                <Badge variant="secondary" className={styles.tag}>
                  +{album.tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Music2 className={styles.statIcon} />
              <span className={styles.statText}>
                {album.itemCount} 首音乐
              </span>
            </div>
            <div className={styles.statItem}>
              <HardDrive className={styles.statIcon} />
              <span className={styles.statText}>
                {formatSize(album.totalSize)}
              </span>
            </div>
          </div>

          {album.keywords && album.keywords.length > 0 && (
            <div className={styles.keywordsContainer}>
              {album.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className={styles.keyword}>
                  {keyword}
                </Badge>
              ))}
              {album.keywords.length > 3 && (
                <Badge variant="outline" className={styles.keyword}>
                  +{album.keywords.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className={styles.footer}>
          <Button
            asChild
            variant="default"
            size="sm"
            className={styles.viewButton}
          >
            <Link href={`/admin/dashboard/resources/music/${album.id}`}>
              <Eye className={styles.iconButton} />
              查看
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className={styles.iconButton} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className={styles.deleteIcon} />
          </Button>
        </CardFooter>
      </Card>

      <EditAlbumDialog
        album={album}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />
      
      <DeleteAlbumDialog
        album={album}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
