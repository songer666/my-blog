"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Plus } from "lucide-react";
import { useCodeRepositoryAPI } from "@/client/resources/code-api";
import { RepositoryForm } from "../form/repository-form";

export function CreateRepositoryDialog() {
  const router = useRouter();
  const { useCreateRepository } = useCodeRepositoryAPI();
  const createMutation = useCreateRepository();
  const [open, setOpen] = useState(false);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    keywords: string;
    isPublic: boolean;
  }) => {
    const keywordsArray = data.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    await createMutation.mutateAsync({
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description.trim() || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      isPublic: data.isPublic,
      sort: 0,
    });

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          创建代码库
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>创建新代码库</DialogTitle>
          <DialogDescription>
            创建一个新的代码库来管理您的代码文件
          </DialogDescription>
        </DialogHeader>

        <RepositoryForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
