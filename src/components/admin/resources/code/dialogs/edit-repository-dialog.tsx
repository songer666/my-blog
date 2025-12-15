"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import type { CodeRepositoryListItem } from "@/server/types/resources-type";
import { useCodeRepositoryAPI } from "@/client/resources/code-api";
import { RepositoryForm } from "../form/repository-form";

interface EditRepositoryDialogProps {
  repository: CodeRepositoryListItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRepositoryDialog({ repository, open, onOpenChange }: EditRepositoryDialogProps) {
  const router = useRouter();
  const { useUpdateRepository } = useCodeRepositoryAPI();
  const updateMutation = useUpdateRepository();

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    description: string;
    keywords: string;
    isPublic: boolean;
    createdAt?: Date;
  }) => {
    const keywordsArray = data.keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    await updateMutation.mutateAsync({
      id: repository.id,
      title: data.title.trim(),
      slug: data.slug.trim(),
      description: data.description.trim() || null,
      keywords: keywordsArray.length > 0 ? keywordsArray : null,
      isPublic: data.isPublic,
      createdAt: data.createdAt,
    });

    onOpenChange(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑代码库</DialogTitle>
          <DialogDescription>修改代码库的基本信息</DialogDescription>
        </DialogHeader>

        <RepositoryForm
          mode="edit"
          initialData={{
            title: repository.title,
            slug: repository.slug,
            description: repository.description || '',
            keywords: repository.keywords?.join(", ") || '',
            isPublic: repository.isPublic,
            createdAt: repository.createdAt ? new Date(repository.createdAt) : undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={updateMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
