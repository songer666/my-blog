"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Upload, Loader2, FileArchive } from "lucide-react";
import { toast } from "sonner";
import { uploadZipToRepositoryAction } from "@/server/actions/resources/r2-action";

const styles = {
  triggerIcon: `h-4 w-4 mr-2`.trim(),
  dialogContent: `sm:max-w-[500px]`.trim(),
  grid: `grid gap-4 py-4`.trim(),
  gridItem: `grid gap-2`.trim(),
  fileInfo: `text-sm text-muted-foreground`.trim(),
  notesList: `text-sm text-muted-foreground space-y-1`.trim(),
  listItems: `list-disc list-inside space-y-1`.trim(),
  spinIcon: `h-4 w-4 mr-2 animate-spin`.trim(),
};

interface UploadZipDialogProps {
  repositoryId: string;
}

export function UploadZipDialog({ repositoryId }: UploadZipDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 验证文件类型
      const fileName = selectedFile.name.toLowerCase();
      if (!fileName.endsWith('.zip')) {
        toast.error("请选择 ZIP 文件（暂不支持 RAR）");
        return;
      }
      
      // 验证文件大小 (500MB)
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast.error("压缩文件大小不能超过 500MB");
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("请选择压缩文件");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('repositoryId', repositoryId);

      const result = await uploadZipToRepositoryAction(formData);

      if (!result.success) {
        throw new Error(result.error || "上传失败");
      }

      toast.success(result.message || "上传成功");
      
      // 如果有错误信息，显示警告
      if (result.data?.errors && result.data.errors.length > 0) {
        console.warn('部分文件上传失败:', result.data.errors);
      }

      setOpen(false);
      setFile(null);
      router.refresh();
    } catch (error: any) {
      console.error("上传失败:", error);
      toast.error(error.message || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!uploading) {
      setOpen(newOpen);
      if (!newOpen) {
        setFile(null);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileArchive className={styles.triggerIcon} />
          上传压缩包
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>上传压缩文件</DialogTitle>
          <DialogDescription>
            选择 ZIP 文件，系统会自动解压并添加所有代码文件到代码库
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <Label htmlFor="zip">压缩文件</Label>
              <Input
                id="zip"
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={uploading}
                required
              />
              {file && (
                <p className={styles.fileInfo}>
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className={styles.notesList}>
              <p>注意事项：</p>
              <ul className={styles.listItems}>
                <li>仅支持 ZIP 格式（RAR 支持开发中）</li>
                <li>压缩文件会被完全解压，保留目录结构</li>
                <li>隐藏文件和系统文件会被自动忽略</li>
                <li>文件大小限制：500MB</li>
                <li>支持所有常见的代码文件格式</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={uploading}
            >
              取消
            </Button>
            <Button type="submit" disabled={uploading || !file}>
              {uploading && <Loader2 className={styles.spinIcon} />}
              {uploading ? "上传中..." : "上传"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
