"use client";

import React, { useState, useId, useEffect } from "react";
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
import { useImageGalleryAPI } from "@/client/resources/image-api";
import { GalleryForm } from "../form/gallery-form";

export function CreateGalleryDialog() {
  const router = useRouter();
  const dialogId = useId();
  const { useCreateGallery } = useImageGalleryAPI();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const createMutation = useCreateGallery();

  // 确保只在客户端挂载后渲染 Dialog
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    tags: string;
    isPublic: boolean;
  }) => {
    await createMutation.mutateAsync({
      title: data.title,
      slug: data.slug,
      description: data.description || undefined,
      tags: data.tags 
        ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : undefined,
      isPublic: data.isPublic,
    });
    setOpen(false);
    router.refresh();
  };

  // 在服务端渲染时只显示触发按钮
  if (!mounted) {
    return (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        创建图库
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button id={`create-gallery-trigger-${dialogId}`}>
          <Plus className="h-4 w-4 mr-2" />
          创建图库
        </Button>
      </DialogTrigger>
      <DialogContent id={`create-gallery-content-${dialogId}`} className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新图库</DialogTitle>
          <DialogDescription>
            创建一个新的图库来组织你的图片资源
          </DialogDescription>
        </DialogHeader>

        <GalleryForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
