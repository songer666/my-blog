"use client";

import { useState, useRef } from "react";
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
import { Upload, Loader2, X, Check, AlertCircle, Images, Info } from "lucide-react";
import { useImageGalleryAPI } from "@/client/resources/image-api";
import { toast } from "sonner";
import { uploadFileToR2Action } from "@/server/actions/resources/r2-action";
import { Badge } from "@/components/shadcn/ui/badge";
import { useUploadTaskStore, uploadTaskStore } from "@/store/imageUpload/store";
import type { UploadTask } from "@/store/imageUpload/type";

const styles = {
  fileInput: `cursor-pointer`.trim(),
  fileCount: `text-sm text-muted-foreground`.trim(),
  progressContainer: `grid gap-2`.trim(),
  progressText: `flex items-center justify-between text-sm`.trim(),
  imageList: `h-[400px] w-full rounded-md border p-4 overflow-y-auto`.trim(),
  imageItem: `flex gap-4 p-4 border rounded-lg bg-card`.trim(),
  previewContainer: `relative w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden border`.trim(),
  previewImage: `w-full h-full object-cover`.trim(),
  statusIcon: `absolute top-1 right-1 bg-background rounded-full p-1`.trim(),
  fileInfo: `flex-1 grid gap-2`.trim(),
  fileHeader: `flex items-start justify-between`.trim(),
  fileName: `font-medium text-sm truncate`.trim(),
  fileSize: `text-xs text-muted-foreground`.trim(),
  altInput: `h-8 text-sm`.trim(),
  altLabel: `text-xs`.trim(),
  errorBadge: `text-xs`.trim(),
  alert: `mb-4`.trim(),
};

interface BatchUploadImagesDialogProps {
  galleryId: string;
}

interface FileWithPreview {
  file: File;
  preview: string;
  alt: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function BatchUploadImagesDialog({ galleryId }: BatchUploadImagesDialogProps) {
  const router = useRouter();
  const { useAddImage } = useImageGalleryAPI();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const uploadingRef = useRef(false);
  
  const addImageMutation = useAddImage();
  
  // 从 zustand store 获取当前图库的上传任务
  const tasks = useUploadTaskStore(state => state.getTasksByGallery(galleryId));
  const activeTasks = useUploadTaskStore(state => state.getActiveTasks());
  const addTask = useUploadTaskStore(state => state.addTask);
  const updateTaskStatus = useUploadTaskStore(state => state.updateTaskStatus);
  const updateTaskProgress = useUploadTaskStore(state => state.updateTaskProgress);
  const updateTaskR2Key = useUploadTaskStore(state => state.updateTaskR2Key);
  const removeTask = useUploadTaskStore(state => state.removeTask);
  
  const hasActiveTasks = activeTasks.length > 0;
  const currentGalleryActiveTasks = tasks.filter(t => t.status === 'pending' || t.status === 'uploading').length;

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;

    // 验证和处理文件
    const validFiles: FileWithPreview[] = [];
    
    for (const file of selectedFiles) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} 不是图片文件`);
        continue;
      }
      
      // 验证文件大小 (100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name} 大小超过 100MB`);
        continue;
      }

      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        alt: '',
        status: 'pending',
      });
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleAltChange = (index: number, alt: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, alt } : f));
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error("请至少选择一张图片");
      return;
    }

    // 添加所有文件到 zustand store
    const taskIds = files.map(f => addTask({
      galleryId,
      fileName: f.file.name,
      fileSize: f.file.size,
      preview: f.preview,
      alt: f.alt,
    }));

    // 清空本地文件列表
    setFiles([]);
    
    // 关闭对话框，让上传在后台进行
    setOpen(false);
    toast.success(`已添加 ${taskIds.length} 个上传任务，正在后台上传...`);

    // 开始后台上传
    uploadingRef.current = true;
    uploadTasksInBackground(taskIds);
  };

  // 后台上传函数 - 前端直接上传到 R2
  const uploadTasksInBackground = async (taskIds: string[]) => {
    const allTasks = uploadTaskStore.getState().tasks;
    
    for (const taskId of taskIds) {
      const task = allTasks.find((t: UploadTask) => t.id === taskId);
      if (!task) continue;

      try {
        updateTaskStatus(taskId, 'uploading');
        updateTaskProgress(taskId, 5);

        // 1. 从 preview URL 重建 File 对象
        const response = await fetch(task.preview);
        const blob = await response.blob();
        const file = new File([blob], task.fileName, { type: blob.type });

        // 2. 获取图片尺寸
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = task.preview;
        });

        updateTaskProgress(taskId, 10);

        // 3. 动态导入 Server Actions
        const { getImageUploadUrlAction, saveImageRecordAction } = await import('@/server/actions/resources/r2-action');
        
        // 4. 获取预签名上传 URL
        const urlResult = await getImageUploadUrlAction({
          galleryId,
          fileName: task.fileName,
          fileType: blob.type,
          fileSize: task.fileSize,
        });

        if (!urlResult.success || !urlResult.data) {
          throw new Error(urlResult.error || '获取上传 URL 失败');
        }

        const { uploadUrl, r2Key } = urlResult.data;
        updateTaskR2Key(taskId, r2Key);
        updateTaskProgress(taskId, 15);

        // 5. 使用 XMLHttpRequest 直接上传到 R2（支持真实进度）
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 70 + 15; // 15-85%
              updateTaskProgress(taskId, percentComplete);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`上传失败: HTTP ${xhr.status}`));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('网络错误'));
          });

          xhr.open('PUT', uploadUrl);
          xhr.setRequestHeader('Content-Type', blob.type);
          xhr.send(file);
        });

        updateTaskProgress(taskId, 85);

        // 6. 保存图片记录到数据库
        const { saveImageRecordAction: saveImageAction } = await import('@/server/actions/resources/r2-action');
        const saveResult = await saveImageAction({
          galleryId,
          fileName: task.fileName,
          r2Key,
          fileSize: task.fileSize,
          mimeType: blob.type,
          width: img.width,
          height: img.height,
          alt: task.alt || undefined,
        });

        if (!saveResult.success) {
          throw new Error(saveResult.error || '保存图片记录失败');
        }

        updateTaskProgress(taskId, 100);
        updateTaskStatus(taskId, 'success');
        
        // 成功后延迟2秒删除任务
        setTimeout(() => removeTask(taskId), 2000);
      } catch (error: any) {
        console.error(`处理图片 ${task.fileName} 失败:`, error);
        updateTaskStatus(taskId, 'error', error.message || '处理失败');
      }
    }

    uploadingRef.current = false;
    router.refresh();
    
    // 检查是否还有错误的任务
    const finalTasks = uploadTaskStore.getState().getTasksByGallery(galleryId);
    const errorCount = finalTasks.filter((t: UploadTask) => t.status === 'error').length;
    const successCount = finalTasks.filter((t: UploadTask) => t.status === 'success').length;
    
    if (errorCount > 0) {
      toast.warning(`上传完成: ${successCount} 个成功，${errorCount} 个失败`);
    } else {
      toast.success(`所有上传任务已完成 (${successCount} 个)`);
    }
  };

  const handleClose = () => {
    if (currentGalleryActiveTasks > 0 && files.length > 0) {
      // 如果有正在上传的任务且还有未提交的文件，提示用户
      if (!confirm('您还有未提交的文件，关闭对话框将丢失这些文件（已提交的任务会继续在后台上传）。确定关闭？')) {
        return;
      }
    }
    
    // 清理预览 URL
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setOpen(false);
  };

  const getStatusIcon = (status: FileWithPreview['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Images className="h-4 w-4 mr-2" />
          批量上传
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>批量上传图片</DialogTitle>
            <DialogDescription>
              选择多张图片并为每张图片设置描述信息
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* 后台上传提示 */}
            {currentGalleryActiveTasks > 0 && (
              <div className={`flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-3 text-sm text-blue-900 dark:text-blue-100 ${styles.alert}`}>
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium">后台上传中</p>
                  <p className="text-xs mt-1">
                    当前图库有 {currentGalleryActiveTasks} 个任务正在后台上传，您可以关闭此对话框继续浏览，上传不会中断
                  </p>
                </div>
              </div>
            )}
            
            {/* 文件选择器 */}
            <div className="grid gap-2">
              <Label htmlFor="files">选择图片 *</Label>
              <Input
                id="files"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
                disabled={hasActiveTasks}
              />
              <p className={styles.fileCount}>
                已选择 {files.length} 张图片（最大 100MB/张）
              </p>
            </div>

            {/* 当前图库的上传任务 */}
            {tasks.length > 0 && (
              <div className="grid gap-2">
                <Label>上传任务</Label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto rounded-md border p-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 text-sm">
                      {task.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                      {task.status === 'success' && <Check className="h-3 w-3 text-green-500" />}
                      {task.status === 'error' && <AlertCircle className="h-3 w-3 text-destructive" />}
                      <span className="flex-1 truncate">{task.fileName}</span>
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 图片列表 */}
            {files.length > 0 && (
              <div className={styles.imageList}>
                <div className="space-y-4">
                  {files.map((fileData, index) => (
                    <div 
                      key={index} 
                      className={styles.imageItem}
                    >
                      {/* 预览图 */}
                      <div className={styles.previewContainer}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={fileData.preview}
                          alt={`预览 ${index + 1}`}
                          className={styles.previewImage}
                        />
                        {getStatusIcon(fileData.status) && (
                          <div className={styles.statusIcon}>
                            {getStatusIcon(fileData.status)}
                          </div>
                        )}
                      </div>

                      {/* 文件信息和 Alt 输入 */}
                      <div className={styles.fileInfo}>
                        <div className={styles.fileHeader}>
                          <div className="flex-1">
                            <p className={styles.fileName}>
                              {fileData.file.name}
                            </p>
                            <p className={styles.fileSize}>
                              {(fileData.file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid gap-1.5">
                          <Label htmlFor={`alt-${index}`} className={styles.altLabel}>
                            图片描述 (Alt)
                          </Label>
                          <Input
                            id={`alt-${index}`}
                            value={fileData.alt}
                            onChange={(e) => handleAltChange(index, e.target.value)}
                            placeholder="用于 SEO 和无障碍访问"
                            className={styles.altInput}
                          />
                        </div>

                        {fileData.status === 'error' && fileData.error && (
                          <Badge variant="destructive" className={styles.errorBadge}>
                            {fileData.error}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              关闭
            </Button>
            <Button 
              type="submit" 
              disabled={files.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              上传 {files.length > 0 ? `${files.length} 张图片` : ''}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
