"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";
import { Code2, Link as LinkIcon, Loader2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { ProjectType } from "@/server/types/project-type";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadcn/ui/select";
import { useProjectAPI } from "@/client/project-api";

const styles = {
  triggerIcon: `h-4 w-4 mr-2`.trim(),
  dialogContent: `sm:max-w-[500px]`.trim(),
  grid: `grid gap-4 py-4`.trim(),
  gridItem: `grid gap-2`.trim(),
  currentLink: `text-sm text-muted-foreground flex items-center gap-2`.trim(),
  linkIcon: `h-4 w-4`.trim(),
  viewLink: `text-blue-600 hover:underline flex items-center gap-1`.trim(),
  externalIcon: `h-3 w-3`.trim(),
  spinIcon: `h-4 w-4 mr-2 animate-spin`.trim(),
};

interface LinkCodeRepositoryDialogProps {
  project: ProjectType;
}

export function LinkCodeRepositoryDialog({ project }: LinkCodeRepositoryDialogProps) {
  const router = useRouter();
  const { useLinkCodeRepository, useGetAllCodeRepositories } = useProjectAPI();
  const [open, setOpen] = useState(false);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState<string | null>(
    project.codeRepositoryId || null
  );

  // 使用 useQuery 加载代码库列表
  const getAllCodeRepositories = useGetAllCodeRepositories();
  const { data: repositories = [], isLoading: loadingRepositories } = useQuery({
    ...getAllCodeRepositories.queryOptions(),
    enabled: open, // 只有在对话框打开时才加载
  });

  // 使用封装的 mutation 处理关联操作
  const linkMutation = useLinkCodeRepository();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await linkMutation.mutateAsync({
      projectId: project.id,
      codeRepositoryId: selectedRepositoryId,
    });
    // mutation 的 onSuccess 已经显示了 toast，这里关闭对话框并刷新
    setOpen(false);
    router.refresh();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!linkMutation.isPending) {
      setOpen(newOpen);
      if (newOpen) {
        setSelectedRepositoryId(project.codeRepositoryId || null);
      }
    }
  };

  // 获取当前关联的代码库信息
  const currentRepository = repositories.find((r: any) => r.id === project.codeRepositoryId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Code2 className={styles.triggerIcon} />
          {project.codeRepositoryId ? "更改代码库" : "关联代码库"}
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>关联代码库</DialogTitle>
          <DialogDescription>
            为项目选择或更改关联的代码库
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            {project.codeRepositoryId && currentRepository && (
              <div className={styles.gridItem}>
                <Label>当前关联</Label>
                <div className={styles.currentLink}>
                  <LinkIcon className={styles.linkIcon} />
                  <a
                    href={`/admin/dashboard/resources/code/${currentRepository.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewLink}
                  >
                    {currentRepository.title}
                    <ExternalLink className={styles.externalIcon} />
                  </a>
                </div>
              </div>
            )}

            <div className={styles.gridItem}>
              <Label htmlFor="repository">选择代码库</Label>
              <Select
                value={selectedRepositoryId || "none"}
                onValueChange={(value) => setSelectedRepositoryId(value === "none" ? null : value)}
                disabled={linkMutation.isPending}
              >
                <SelectTrigger id="repository">
                  <SelectValue placeholder="选择一个代码库" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">不关联任何代码库</SelectItem>
                  {repositories.map((repo: any) => (
                    <SelectItem key={repo.id} value={repo.id}>
                      {repo.title} ({repo.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={linkMutation.isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={linkMutation.isPending}>
              {linkMutation.isPending && <Loader2 className={styles.spinIcon} />}
              {linkMutation.isPending ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
