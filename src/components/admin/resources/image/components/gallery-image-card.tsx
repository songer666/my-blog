"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GalleryImageItem } from "@/server/types/resources-type";
import { Button } from "@/components/shadcn/ui/button";
import { Eye, Trash2, RefreshCw } from "lucide-react";
import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { getSignedUrlAction } from "@/server/actions/resources/r2-action";
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
  card: `relative border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50`.trim(),
  imageContainer: `relative w-full aspect-square bg-muted overflow-hidden`.trim(),
  loadingContainer: `w-full h-full flex items-center justify-center text-muted-foreground`.trim(),
  image: `w-full h-full object-cover`.trim(),
  infoContainer: `p-3 space-y-2`.trim(),
  title: `font-medium text-sm line-clamp-1`.trim(),
  sizeInfo: `flex items-center justify-between text-xs text-muted-foreground`.trim(),
  altText: `text-xs text-muted-foreground line-clamp-1`.trim(),
  buttonGroup: `flex gap-2 mt-3 pt-2 border-t border-border`.trim(),
  iconButton: `h-7 w-7 p-0`.trim(),
  deleteIcon: `h-3.5 w-3.5 text-destructive`.trim(),
};

interface GalleryImageCardProps {
  image: GalleryImageItem;
  galleryId: string;
}

export function GalleryImageCard({ image, galleryId }: GalleryImageCardProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const deleteMutation = useMutation({
    ...trpc.imageGallery.removeImage.mutationOptions(),
    onSuccess: () => {
      toast.success("图片删除成功");
      setDeleteDialogOpen(false);
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "删除失败");
    },
  });

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const fetchSignedUrl = async () => {
    setLoading(true);
    try {
      const result = await getSignedUrlAction(image.r2Key);
      if (result.success && result.signedUrl) {
        setImageUrl(result.signedUrl);
      } else {
        toast.error("获取图片失败");
      }
    } catch (error) {
      toast.error("获取图片失败");
    } finally {
      setLoading(false);
    }
  };

  const handleView = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate({
      galleryId,
      imageId: image.id,
    });
  };

  // 加载签名 URL
  useEffect(() => {
    fetchSignedUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={styles.card}>
        {/* 图片预览 */}
        <div className={styles.imageContainer}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={image.alt || image.name}
              className={styles.image}
            />
          ) : (
            <div className={styles.loadingContainer}>
              <p className="text-sm">加载失败</p>
            </div>
          )}
        </div>

        {/* 图片信息 */}
        <div className={styles.infoContainer}>
          <p className={styles.title} title={image.name}>
            {image.name}
          </p>
          <div className={styles.sizeInfo}>
            <span>{image.width}x{image.height}</span>
            <span>{formatSize(image.fileSize)}</span>
          </div>
          {image.alt && (
            <p className={styles.altText}>
              {image.alt}
            </p>
          )}
          
          {/* 操作按钮 - 放在信息区域下方，避免覆盖 */}
          <div className={styles.buttonGroup}>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleView}
              disabled={!imageUrl}
              className={styles.iconButton}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setDeleteDialogOpen(true)}
              className={styles.iconButton}
            >
              <Trash2 className={styles.deleteIcon} />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除图片 "{image.name}" 吗？此操作无法恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "删除中..." : "确认删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
