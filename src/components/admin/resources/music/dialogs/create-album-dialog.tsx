"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Plus } from "lucide-react";
import { useMusicAlbumAPI } from "@/client/resources/music-api";
import { AlbumForm } from "../form/album-form";

export function CreateAlbumDialog() {
  const router = useRouter();
  const dialogId = useId();
  const { useCreateAlbum } = useMusicAlbumAPI();
  const [open, setOpen] = useState(false);

  const createMutation = useCreateAlbum();

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    tags: string;
    isPublic: boolean;
    createdAt?: Date;
  }) => {
    await createMutation.mutateAsync({
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
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button id={`create-album-trigger-${dialogId}`}>
          <Plus className="h-4 w-4 mr-2" />
          创建专辑
        </Button>
      </DialogTrigger>
      <DialogContent id={`create-album-content-${dialogId}`} className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新专辑</DialogTitle>
          <DialogDescription>
            创建一个新的音乐专辑来组织你的音乐资源
          </DialogDescription>
        </DialogHeader>

        <AlbumForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
