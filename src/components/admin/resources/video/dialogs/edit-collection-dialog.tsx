"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useVideoCollectionAPI } from "@/client/resources/video-api";
import type { VideoCollection } from "@/server/types/resources-type";
import { CollectionForm } from "../form/collection-form";

interface EditCollectionDialogProps {
  collection: VideoCollection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCollectionDialog({ collection, open, onOpenChange }: EditCollectionDialogProps) {
  const router = useRouter();
  const { useUpdateCollection } = useVideoCollectionAPI();
  const updateMutation = useUpdateCollection();

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    keywords: string;
    isPublic: boolean;
  }) => {
    await updateMutation.mutateAsync({
      id: collection.id,
      title: data.title,
      slug: data.slug,
      description: data.description || undefined,
      coverImage: data.coverImage || undefined,
      keywords: data.keywords 
        ? data.keywords.split(',').map(keyword => keyword.trim()).filter(Boolean)
        : undefined,
      isPublic: data.isPublic,
    });
    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑视频集</DialogTitle>
          <DialogDescription>
            修改视频集的基本信息
          </DialogDescription>
        </DialogHeader>

        <CollectionForm
          mode="edit"
          initialData={{
            title: collection.title,
            slug: collection.slug,
            description: collection.description || '',
            coverImage: collection.coverImage || '',
            keywords: collection.keywords?.join(', ') || '',
            isPublic: collection.isPublic,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
