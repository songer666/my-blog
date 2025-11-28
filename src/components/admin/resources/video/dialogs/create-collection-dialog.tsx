"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Plus } from "lucide-react";
import { useVideoCollectionAPI } from "@/client/resources/video-api";
import { CollectionForm } from "../form/collection-form";

interface CreateCollectionDialogProps {
  children?: React.ReactNode;
}

export function CreateCollectionDialog({ children }: CreateCollectionDialogProps) {
  const router = useRouter();
  const { useCreateCollection } = useVideoCollectionAPI();
  const createMutation = useCreateCollection();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // 确保只在客户端挂载后渲染 Dialog
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    keywords: string;
    isPublic: boolean;
  }) => {
    const keywordArray = data.keywords
      ? data.keywords.split(',').map(k => k.trim()).filter(k => k)
      : [];

    await createMutation.mutateAsync({
      title: data.title,
      slug: data.slug,
      description: data.description || undefined,
      coverImage: data.coverImage || undefined,
      keywords: keywordArray.length > 0 ? keywordArray : undefined,
      isPublic: data.isPublic,
      sort: 0,
    });

    setOpen(false);
    router.refresh();
  };

  // 在服务端渲染时只显示触发按钮
  if (!mounted) {
    return children || (
      <Button>
        <Plus className="h-4 w-4 mr-2" />
        创建视频集
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            创建视频集
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新视频集</DialogTitle>
          <DialogDescription>
            创建一个新的视频集来组织您的视频文件
          </DialogDescription>
        </DialogHeader>

        <CollectionForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
