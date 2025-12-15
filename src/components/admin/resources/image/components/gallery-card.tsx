"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { imageGalleryListItemSchema } from "@/server/schema/resources-schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { FolderOpen, Image as ImageIcon, HardDrive, Eye, Pencil, Trash2 } from "lucide-react";
import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { EditGalleryDialog } from "../dialogs/edit-gallery-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog";

const styles = {
  card: `group hover:shadow-lg transition-shadow p-0 overflow-hidden`.trim(),
  coverContainer: `relative w-full h-80 bg-muted`.trim(),
  coverImage: `w-full h-full object-cover`.trim(),
  coverGradient: `absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent`.trim(),
  emptyCover: `w-full h-full flex items-center justify-center`.trim(),
  emptyIcon: `h-16 w-16 text-muted-foreground/30`.trim(),
  headerContainer: `pt-4`.trim(),
  titleRow: `flex items-start justify-between`.trim(),
  titleGroup: `flex items-center gap-2`.trim(),
  titleIcon: `h-5 w-5 text-primary`.trim(),
  title: `text-lg`.trim(),
  description: `text-sm text-muted-foreground line-clamp-2 mt-2`.trim(),
  tagsContainer: `flex flex-wrap gap-1 mt-3`.trim(),
  tag: `text-xs`.trim(),
  statsGrid: `grid grid-cols-2 gap-4`.trim(),
  statItem: `flex items-center gap-2 text-sm`.trim(),
  statIcon: `h-4 w-4 text-muted-foreground`.trim(),
  statText: `text-muted-foreground`.trim(),
  keywordsContainer: `flex flex-wrap gap-1 mt-4`.trim(),
  keyword: `text-xs`.trim(),
  footer: `flex gap-2 pb-4`.trim(),
  viewButton: `flex-1`.trim(),
  iconButton: `h-4 w-4`.trim(),
  deleteIcon: `h-4 w-4 text-destructive`.trim(),
  deleteButton: `bg-destructive text-destructive-foreground hover:bg-destructive/90`.trim(),
};

type ImageGalleryListItem = z.infer<typeof imageGalleryListItemSchema>;

interface GalleryCardProps {
  gallery: ImageGalleryListItem;
}

export function GalleryCard({ gallery }: GalleryCardProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const deleteMutation = useMutation({
    ...trpc.imageGallery.delete.mutationOptions(),
    onSuccess: () => {
      toast.success("图库删除成功");
      setDeleteDialogOpen(false);
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "删除失败");
    },
  });

  const handleDelete = async () => {
    deleteMutation.mutate({ id: gallery.id });
  };

  return (
    <>
      <Card className={styles.card}>
        {/* 封面图片 */}
        <div className={styles.coverContainer}>
          <div className={styles.emptyCover}>
            <FolderOpen className={styles.emptyIcon} />
          </div>
        </div>
        
        <CardHeader className={styles.headerContainer}>
          <div className={styles.titleRow}>
            <div className={styles.titleGroup}>
              <FolderOpen className={styles.titleIcon} />
              <CardTitle className={styles.title}>{gallery.title}</CardTitle>
            </div>
            {!gallery.isPublic && (
              <Badge variant="secondary">私密</Badge>
            )}
          </div>
          {gallery.description && (
            <p className={styles.description}>
              {gallery.description}
            </p>
          )}

          {/* 标签显示 */}
          {gallery.tags && gallery.tags.length > 0 && (
            <div className={styles.tagsContainer}>
              {gallery.tags.slice(0, 5).map((tag, index) => (
                <Badge key={index} variant="secondary" className={styles.tag}>
                  {tag}
                </Badge>
              ))}
              {gallery.tags.length > 5 && (
                <Badge variant="secondary" className={styles.tag}>
                  +{gallery.tags.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <ImageIcon className={styles.statIcon} />
              <span className={styles.statText}>
                {gallery.itemCount} 张图片
              </span>
            </div>
            <div className={styles.statItem}>
              <HardDrive className={styles.statIcon} />
              <span className={styles.statText}>
                {formatSize(gallery.totalSize)}
              </span>
            </div>
          </div>

          {gallery.keywords && gallery.keywords.length > 0 && (
            <div className={styles.keywordsContainer}>
              {gallery.keywords.slice(0, 3).map((keyword, index) => (
                <Badge key={index} variant="outline" className={styles.keyword}>
                  {keyword}
                </Badge>
              ))}
              {gallery.keywords.length > 3 && (
                <Badge variant="outline" className={styles.keyword}>
                  +{gallery.keywords.length - 3}
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
            <Link href={`/admin/dashboard/resources/image/${gallery.id}`}>
              <Eye className={styles.iconButton} />
              查看
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
          >
            <Pencil className={styles.iconButton} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className={styles.deleteIcon} />
          </Button>
        </CardFooter>
      </Card>

      <EditGalleryDialog
        gallery={gallery}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除图库 "{gallery.title}" 吗？此操作将删除图库中的所有图片，且无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className={styles.deleteButton}
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
