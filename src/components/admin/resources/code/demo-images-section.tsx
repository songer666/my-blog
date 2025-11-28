"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
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
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { UploadDemoImageDialog } from "./dialogs/upload-demo-image-dialog";
import type { DemoImageItem } from "@/server/types/resources-type";
import { useRouter } from "next/navigation";
import { useCodeRepositoryAPI } from "@/client/resources/code-api";
import { R2Image } from "./r2-image";

const styles = {
  container: ``.trim(),
  header: `flex items-center justify-between mb-4`.trim(),
  title: `text-xl font-semibold flex items-center gap-2`.trim(),
  titleIcon: `h-5 w-5`.trim(),
  emptyCard: `p-12 text-center text-muted-foreground`.trim(),
  emptyIcon: `h-12 w-12 mx-auto mb-4 opacity-50`.trim(),
  emptyHint: `text-sm mt-2`.trim(),
  grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.trim(),
  card: `overflow-hidden`.trim(),
  imageContainer: `relative aspect-video bg-muted`.trim(),
  imageSizes: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`.trim(),
  cardHeader: `p-4`.trim(),
  headerRow: `flex items-start justify-between gap-2`.trim(),
  headerContent: `flex-1 min-w-0`.trim(),
  cardTitle: `text-sm truncate`.trim(),
  altText: `text-xs text-muted-foreground mt-1 truncate`.trim(),
  deleteButton: `shrink-0 h-8 w-8 text-destructive hover:text-destructive`.trim(),
  deleteIcon: `h-4 w-4`.trim(),
  metadata: `text-xs text-muted-foreground mt-2`.trim(),
  dialogInfo: `my-4`.trim(),
  dialogInfoList: `text-sm text-muted-foreground space-y-2`.trim(),
  dialogWarning: `text-destructive font-medium mt-3`.trim(),
  dialogDestructive: `bg-destructive text-destructive-foreground hover:bg-destructive/90`.trim(),
};

interface DemoImagesSectionProps {
  repositoryId: string;
  images: DemoImageItem[];
}

export function DemoImagesSection({ repositoryId, images }: DemoImagesSectionProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<DemoImageItem | null>(null);
  const { useRemoveDemoImage } = useCodeRepositoryAPI();
  const removeDemoImage = useRemoveDemoImage();

  const handleDeleteClick = (image: DemoImageItem) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;

    setDeletingId(imageToDelete.id);
    try {
      await removeDemoImage.mutateAsync({
        repositoryId,
        imageId: imageToDelete.id,
      });
      router.refresh();
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    } catch (error) {
      console.error('删除失败:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <ImageIcon className={styles.titleIcon} />
          演示图片 ({images.length})
        </h2>
        <UploadDemoImageDialog repositoryId={repositoryId} />
      </div>

      {images.length === 0 ? (
        <Card>
          <CardContent className={styles.emptyCard}>
            <ImageIcon className={styles.emptyIcon} />
            <p>暂无演示图片</p>
            <p className={styles.emptyHint}>点击上方按钮添加演示图片</p>
          </CardContent>
        </Card>
      ) : (
        <div className={styles.grid}>
          {images.map((image) => (
            <Card key={image.id} className={styles.card}>
              <div className={styles.imageContainer}>
                <R2Image
                  r2Key={image.r2Key}
                  alt={image.alt || image.name}
                  fill
                  className="object-cover"
                  sizes={styles.imageSizes}
                />
              </div>
              <CardHeader className={styles.cardHeader}>
                <div className={styles.headerRow}>
                  <div className={styles.headerContent}>
                    <CardTitle className={styles.cardTitle}>{image.name}</CardTitle>
                    {image.alt && (
                      <p className={styles.altText}>
                        {image.alt}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(image)}
                    disabled={deletingId === image.id}
                  >
                    <Trash2 className={styles.deleteIcon} />
                  </Button>
                </div>
                <div className={styles.metadata}>
                  {image.width} × {image.height} • {(image.fileSize / 1024).toFixed(1)} KB
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除演示图片</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除图片 "{imageToDelete?.name}" 吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className={styles.dialogInfo}>
            {imageToDelete && (
              <div className={styles.dialogInfoList}>
                <p>• 图片名称: {imageToDelete.name}</p>
                {imageToDelete.alt && <p>• 描述: {imageToDelete.alt}</p>}
                <p>• 尺寸: {imageToDelete.width} × {imageToDelete.height}</p>
                <p className={styles.dialogWarning}>
                  此操作不可撤销，图片将从 R2 存储中永久删除。
                </p>
              </div>
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingId !== null}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deletingId !== null}
              className={styles.dialogDestructive}
            >
              {deletingId ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
