"use client";

import { ReactNode } from "react";
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
  AlertDialogTrigger,
} from "@/components/shadcn/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useMusicAlbumAPI } from "@/client/resources/music-api";
import type { AlbumMusicItem } from "@/server/types/resources-type";

const styles = {
  errorText: `text-destructive`.trim(),
  buttonIcon: `h-4 w-4 mr-2`.trim(),
  deleteButton: `bg-destructive hover:bg-destructive/90`.trim(),
};

interface DeleteMusicDialogProps {
  albumId: string;
  music: AlbumMusicItem;
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteMusicDialog({ 
  albumId, 
  music, 
  children, 
  open, 
  onOpenChange 
}: DeleteMusicDialogProps) {
  const router = useRouter();
  const { useRemoveMusic } = useMusicAlbumAPI();
  const deleteMutation = useRemoveMusic();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ 
      albumId, 
      musicId: music.id 
    });
    router.refresh();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {children && (
        <AlertDialogTrigger asChild>
          {children}
        </AlertDialogTrigger>
      )}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除</AlertDialogTitle>
          <AlertDialogDescription>
            你确定要删除音乐 <strong>{music.name}</strong> 吗？
            <br />
            <span className="text-destructive">
              此操作将从 R2 存储中删除该音乐文件，且无法恢复！
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
