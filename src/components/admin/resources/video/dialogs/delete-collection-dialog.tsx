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
import type { VideoCollection } from "@/server/types/resources-type";

const styles = {
  errorText: `text-destructive`.trim(),
  buttonIcon: `h-4 w-4 mr-2`.trim(),
  deleteButton: `bg-destructive hover:bg-destructive/90`.trim(),
};

interface DeleteCollectionDialogProps {
  collection: VideoCollection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteCollectionDialog({
  collection,
  open,
  onOpenChange,
}: DeleteCollectionDialogProps) {
  const router = useRouter();
  const { useDeleteCollection } = useVideoCollectionAPI();
  const deleteMutation = useDeleteCollection();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: collection.id });
    onOpenChange(false);
    router.push('/admin/dashboard/resources/video');
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除视频集？</AlertDialogTitle>
          <AlertDialogDescription>
            此操作将永久删除视频集 <strong>&quot;{collection.title}&quot;</strong> 及其所有视频文件（共 {collection.itemCount} 个视频）。
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
