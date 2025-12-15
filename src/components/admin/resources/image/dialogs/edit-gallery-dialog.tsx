"use client";

import { useRouter } from "next/navigation";
import { z } from "zod";
import { imageGalleryListItemSchema } from "@/server/schema/resources-schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { GalleryForm } from "../form/gallery-form";

type ImageGalleryListItem = z.infer<typeof imageGalleryListItemSchema>;

interface EditGalleryDialogProps {
  gallery: ImageGalleryListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGalleryDialog({ gallery, open, onOpenChange }: EditGalleryDialogProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const updateMutation = useMutation({
    ...trpc.imageGallery.update.mutationOptions(),
    onSuccess: () => {
      toast.success("图库更新成功");
      onOpenChange(false);
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "更新失败");
    },
  });

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    tags: string;
    isPublic: boolean;
    createdAt?: Date;
  }) => {
    updateMutation.mutate({
      id: gallery.id,
      title: data.title,
      slug: data.slug,
      description: data.description || undefined,
      tags: data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : undefined,
      isPublic: data.isPublic,
      createdAt: data.createdAt,
    });
  };

  return (
    <Dialog 
      key={`edit-gallery-dialog-${gallery.id}`} 
      open={open} 
      onOpenChange={onOpenChange}
      modal={true}
    >
      <DialogContent 
        id={`edit-gallery-dialog-content-${gallery.id}`}
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>编辑图库</DialogTitle>
          <DialogDescription>
            修改图库的基本信息
          </DialogDescription>
        </DialogHeader>

        <GalleryForm
          mode="edit"
          initialData={{
            title: gallery.title,
            slug: gallery.slug,
            description: gallery.description || '',
            tags: gallery.tags?.join(', ') || '',
            isPublic: gallery.isPublic,
            createdAt: gallery.createdAt ? new Date(gallery.createdAt) : undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
