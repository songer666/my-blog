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
import { Upload, Loader2 } from "lucide-react";
import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { uploadFileToR2Action } from "@/server/actions/resources/r2-action";

const styles = {
  dialogContent: `sm:max-w-[500px]`.trim(),
  formGrid: `grid gap-4 py-4`.trim(),
  fieldGrid: `grid gap-2`.trim(),
  fileInfo: `text-sm text-muted-foreground`.trim(),
  previewContainer: `relative w-full aspect-video bg-muted rounded-lg overflow-hidden border`.trim(),
  previewImage: `w-full h-full object-contain`.trim(),
  buttonIcon: `h-4 w-4 mr-2`.trim(),
};

interface UploadImageToGalleryDialogProps {
  galleryId: string;
}

export function UploadImageToGalleryDialog({ galleryId }: UploadImageToGalleryDialogProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [alt, setAlt] = useState("");

  const addImageMutation = useMutation({
    ...trpc.imageGallery.addImage.mutationOptions(),
    onSuccess: () => {
      toast.success("图片上传成功");
      setOpen(false);
      setFile(null);
      setAlt("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "上传失败");
    },
  });

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
      const img = new Image();
      const imgUrl = URL.createObjectURL(file);
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imgUrl;
      });

      URL.revokeObjectURL(imgUrl);

      // 2. 动态导入 Server Actions
      const { getImageUploadUrlAction, saveImageRecordAction } = await import('@/server/actions/resources/r2-action');
      
      // 3. 获取预签名上传 URL
      const urlResult = await getImageUploadUrlAction({
        galleryId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      if (!urlResult.success || !urlResult.data) {
        throw new Error(urlResult.error || '获取上传 URL 失败');
      }

      const { uploadUrl, r2Key } = urlResult.data;

      // 4. 使用 fetch 直接上传到 R2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`上传失败: HTTP ${uploadResponse.status}`);
      }

      // 5. 保存图片记录到数据库
      const saveResult = await saveImageRecordAction({
        galleryId,
        fileName: file.name,
        r2Key,
        fileSize: file.size,
        mimeType: file.type,
        width: img.width,
        height: img.height,
        alt: alt || undefined,
      });

      if (!saveResult.success) {
        throw new Error(saveResult.error || '保存图片记录失败');
      }

      toast.success("图片上传成功");
      setOpen(false);
      setFile(null);
      setAlt("");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      router.refresh();
    } catch (error: any) {
      console.error('上传错误:', error);
      toast.error(error.message || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
      modal={true}
    >
      <DialogTrigger asChild>
        <Button id={`upload-trigger-btn-${galleryId}`}>
          <Upload className="h-4 w-4 mr-2" />
          上传图片
        </Button>
      </DialogTrigger>
      <DialogContent 
        id={`upload-dialog-content-${galleryId}`}
        className="sm:max-w-[500px]" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>上传图片</DialogTitle>
            <DialogDescription>
              选择要上传到此图库的图片文件
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">选择图片 *</Label>
              <Input
                id="file"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || addImageMutation.isPending}
                required
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  已选择: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            {/* 图片预览 */}
            {previewUrl && (
              <div className="grid gap-2">
                <Label>预览</Label>
                <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="alt">图片描述 (Alt)</Label>
              <Input
                id="alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="用于 SEO 和无障碍访问"
                disabled={uploading || addImageMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={uploading || addImageMutation.isPending}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || addImageMutation.isPending || !file}
            >
              {(uploading || addImageMutation.isPending) && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              上传
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
