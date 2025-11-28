"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadCodeToRepositoryAction } from "@/server/actions/resources/r2-action";

const styles = {
  trigger: ``.trim(),
  triggerIcon: `h-4 w-4 mr-2`.trim(),
  grid: `grid gap-4 py-4`.trim(),
  gridItem: `grid gap-2`.trim(),
  fileInfo: `text-sm text-muted-foreground`.trim(),
  hint: `text-xs text-muted-foreground`.trim(),
};

interface UploadCodeDialogProps {
  repositoryId: string;
}

export function UploadCodeDialog({ repositoryId }: UploadCodeDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePath, setFilePath] = useState("");
  const [isPending, startTransition] = useTransition();

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // 如果没有设置路径，使用文件名作为默认路径
      if (!filePath) {
        setFilePath(selectedFile.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('repositoryId', repositoryId);
        formData.append('path', filePath || file.name);

        const result = await uploadCodeToRepositoryAction(formData);

        if (result.success) {
          toast.success('代码文件上传成功', {
            position: 'top-center',
          });
          setOpen(false);
          setFile(null);
          setFilePath("");
          router.refresh();
        } else {
          toast.error('上传失败', {
            description: result.error || '请稍后重试',
            position: 'top-center',
          });
        }
      } catch (error: any) {
        console.error('上传代码文件失败:', error);
        toast.error('上传失败', {
          description: error.message || '网络错误',
          position: 'top-center',
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={styles.trigger}>
          <Upload className={styles.triggerIcon} />
          上传代码
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传代码文件</DialogTitle>
          <DialogDescription>
            选择代码文件上传到此代码库
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <Label htmlFor="code-file">选择文件 *</Label>
              <Input
                id="code-file"
                type="file"
                onChange={handleFileChange}
                required
                accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.go,.rs,.rb,.php,.swift,.kt,.dart,.html,.css,.scss,.json,.xml,.yaml,.yml,.md,.sql,.sh"
              />
              {file && (
                <p className={styles.fileInfo}>
                  已选择: {file.name} ({formatBytes(file.size)})
                </p>
              )}
            </div>

            <div className={styles.gridItem}>
              <Label htmlFor="file-path">文件路径</Label>
              <Input
                id="file-path"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                placeholder="src/components/Button.tsx"
              />
              <p className={styles.hint}>
                指定文件在代码库中的路径（可选）
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              取消
            </Button>
            <Button type="submit" disabled={!file || isPending}>
              <Upload className={styles.triggerIcon} />
              {isPending ? "上传中..." : "开始上传"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
