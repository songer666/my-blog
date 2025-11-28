"use client";

import { useRouter } from "next/navigation";
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
import { useVideoCollectionAPI } from "@/client/resources/video-api";
import type { CollectionVideoItem } from "@/server/types/resources-type";

const styles = {
  errorText: `text-destructive`.trim(),
  buttonIcon: `h-4 w-4 mr-2`.trim(),
  deleteButton: `bg-destructive hover:bg-destructive/90`.trim(),
};

interface DeleteVideoDialogProps {
  collectionId: string;
  video: CollectionVideoItem;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteVideoDialog({
  collectionId,
  video,
  open,
  onOpenChange,
}: DeleteVideoDialogProps) {
  const router = useRouter();
  const { useRemoveVideo } = useVideoCollectionAPI();
  const deleteMutation = useRemoveVideo();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ 
      collectionId, 
      videoId: video.id 
    });
    router.refresh();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除视频？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将永久删除视频 <strong>&quot;{video.name}&quot;</strong>。
            <br />
            <span className={styles.errorText}>
              此操作无法撤销，文件将从云存储中永久删除。
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className={styles.deleteButton}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? '删除中...' : '确认删除'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
