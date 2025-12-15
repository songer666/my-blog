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
import { Loader2 } from "lucide-react";
import { useMusicAlbumAPI } from "@/client/resources/music-api";
import type { MusicAlbumList } from "@/server/types/resources-type";

const styles = {
  errorText: `text-destructive`.trim(),
  buttonIcon: `h-4 w-4 mr-2`.trim(),
  deleteButton: `bg-destructive hover:bg-destructive/90`.trim(),
};

interface DeleteAlbumDialogProps {
  album: MusicAlbumList[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAlbumDialog({ album, open, onOpenChange }: DeleteAlbumDialogProps) {
  const router = useRouter();
  const { useDeleteAlbum } = useMusicAlbumAPI();
  const deleteMutation = useDeleteAlbum();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: album.id });
    onOpenChange(false);
    router.refresh();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除专辑 <strong>{album.title}</strong> 吗？
            <br />
            <span className="text-destructive">
              此操作将删除专辑中的所有音乐文件（共 {album.itemCount} 首），且无法恢复！
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive hover:bg-destructive/90"
          >
            {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
