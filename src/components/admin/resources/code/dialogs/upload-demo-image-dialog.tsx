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
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { getCodeDemoImageUploadUrlAction } from "@/server/actions/resources/r2-client-action";
import { useCodeRepositoryAPI } from "@/client/resources/code-api";
import Image from "next/image";

const styles = {
  triggerIcon: `h-4 w-4 mr-2`.trim(),
  dialogContent: `sm:max-w-[500px]`.trim(),
  grid: `grid gap-4 py-4`.trim(),
  gridItem: `grid gap-2`.trim(),
  fileInfo: `text-sm text-muted-foreground`.trim(),
  preview: `relative w-full aspect-video bg-muted rounded-lg overflow-hidden border`.trim(),
  previewSizes: `(max-width: 500px) 100vw, 500px`.trim(),
  spinIcon: `h-4 w-4 mr-2 animate-spin`.trim(),
};

interface UploadDemoImageDialogProps {
  repositoryId: string;
}

export function UploadDemoImageDialog({ repositoryId }: UploadDemoImageDialogProps) {
  const router = useRouter();
  const { useAddDemoImage } = useCodeRepositoryAPI();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const addDemoImageMutation = useAddDemoImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 验证文件类型
      if (!selectedFile.type.startsWith('image/')) {
        toast.error("请选择图片文件");
        return;
      }
      
      // 验证文件大小 (100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error("图片大小不能超过 100MB");
        return;
      }

      setFile(selectedFile);
      
      // 生成预览 URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("请选择图片文件");
      return;
    }

    setUploading(true);

    try {
      // 1. 获取图片尺寸
      const img = new window.Image();
      const imgUrl = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      const width = img.width;
      const height = img.height;
      URL.revokeObjectURL(imgUrl);

      // 2. 获取预签名上传 URL
      const urlResult = await getCodeDemoImageUploadUrlAction({
        repositoryId: repositoryId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!urlResult.success || !urlResult.data) {
        throw new Error(urlResult.error || "获取上传 URL 失败");
      }

      const { uploadUrl, r2Key } = urlResult.data;

      // 3. 使用预签名 URL 上传文件
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`上传失败: ${uploadResponse.statusText}`);
      }

      // 4. 添加到代码库
      await addDemoImageMutation.mutateAsync({
        repositoryId,
        name: file.name,
        r2Key: r2Key,
        fileSize: file.size,
        mimeType: file.type,
        width,
        height,
        alt: alt.trim() || undefined,
      });

      setOpen(false);
      setFile(null);
      setAlt("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
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
        setAlt("");
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload className={styles.triggerIcon} />
          添加图片
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>上传演示图片</DialogTitle>
          <DialogDescription>
            选择要上传的演示图片
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <Label htmlFor="image">图片文件</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
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

            {previewUrl && (
              <div className={styles.preview}>
                <Image
                  src={previewUrl}
                  alt="预览"
                  fill
                  className="object-contain"
                  sizes={styles.previewSizes}
                />
              </div>
            )}

            <div className={styles.gridItem}>
              <Label htmlFor="alt">图片描述（可选）</Label>
              <Input
                id="alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="图片描述"
                disabled={uploading}
              />
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
