"use client";

import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { AlertCircle } from "lucide-react";
import type { CodeRepository } from "@/server/types/resources-type";
import { useCodeRepositoryAPI } from "@/client/resources/code-api";

const styles = {
  warning: `flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md`.trim(),
  warningIcon: `h-5 w-5 text-destructive mt-0.5`.trim(),
  warningText: `text-sm text-destructive flex-1`.trim(),
  info: `text-sm text-muted-foreground mt-2`.trim(),
};

interface DeleteRepositoryDialogProps {
  repository: CodeRepository;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteRepositoryDialog({ repository, open, onOpenChange }: DeleteRepositoryDialogProps) {
  const router = useRouter();
  const { useDeleteRepository } = useCodeRepositoryAPI();
  const deleteMutation = useDeleteRepository();

  const handleDelete = async () => {
    await deleteMutation.mutateAsync({ id: repository.id });
    onOpenChange(false);
    router.push("/admin/dashboard/resources/code");
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删除代码库</DialogTitle>
          <DialogDescription>
            确定要删除代码库 "{repository.title}" 吗？
          </DialogDescription>
        </DialogHeader>

        <div className={styles.warning}>
          <AlertCircle className={styles.warningIcon} />
          <div className={styles.warningText}>
            <p className="font-medium">此操作不可撤销！</p>
            <p className={styles.info}>
              将永久删除此代码库及其包含的所有 {repository.itemCount} 个代码文件。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            取消
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "删除中..." : "确认删除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
