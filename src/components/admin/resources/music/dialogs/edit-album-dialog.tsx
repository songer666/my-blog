"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useMusicAlbumAPI } from "@/client/resources/music-api";
import type { MusicAlbumList } from "@/server/types/resources-type";
import { AlbumForm } from "../form/album-form";

interface EditAlbumDialogProps {
  album: MusicAlbumList[number];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAlbumDialog({ album, open, onOpenChange }: EditAlbumDialogProps) {
  const router = useRouter();
  const { useUpdateAlbum } = useMusicAlbumAPI();
  const updateMutation = useUpdateAlbum();

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    tags: string;
    isPublic: boolean;
    createdAt?: Date;
  }) => {
    await updateMutation.mutateAsync({
      id: album.id,
      title: data.title,
      slug: data.slug,
      description: data.description || undefined,
      coverImage: data.coverImage || undefined,
      tags: data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : undefined,
      isPublic: data.isPublic,
      createdAt: data.createdAt,
    });
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog 
      key={`edit-album-dialog-${album.id}`} 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        id={`edit-album-dialog-content-${album.id}`}
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>编辑专辑</DialogTitle>
          <DialogDescription>
            修改专辑的基本信息
          </DialogDescription>
        </DialogHeader>

        <AlbumForm
          mode="edit"
          initialData={{
            title: album.title,
            slug: album.slug,
            description: album.description || '',
            coverImage: album.coverImage || '',
            tags: album.tags?.join(', ') || '',
            isPublic: album.isPublic,
            createdAt: album.createdAt ? new Date(album.createdAt) : undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
