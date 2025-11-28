"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/shadcn/ui/dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { videoUploadTaskStore } from "@/store/videoUpload/store";

const styles = {
  trigger: ``.trim(),
  triggerIcon: `h-4 w-4 mr-2`.trim(),
  grid: `grid gap-4 py-4`.trim(),
  gridItem: `grid gap-2`.trim(),
  fileInfo: `text-sm text-muted-foreground`.trim(),
};

interface UploadVideoDialogProps {
  collectionId: string;
}

// 后台上传任务处理函数 - 前端直接上传到 R2
const uploadTaskInBackground = async (taskId: string, file: File, collectionId: string, router: any) => {
  const store = videoUploadTaskStore.getState();
  
  try {
    // 更新状态为上传中
    store.updateTaskStatus(taskId, 'uploading');
    store.updateTaskProgress(taskId, 0, 0, 0);

    // 获取任务信息
    const task = store.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('任务不存在');

    // 动态导入 Server Actions
    const { getVideoUploadUrlAction, saveVideoRecordAction } = await import('@/server/actions/resources/r2-action');
    
    // 1. 获取预签名上传 URL
    store.updateTaskProgress(taskId, 5, 0, 0);
    const urlResult = await getVideoUploadUrlAction({
      collectionId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

    if (!urlResult.success || !urlResult.data) {
      throw new Error(urlResult.error || '获取上传 URL 失败');
    }

    const { uploadUrl, r2Key } = urlResult.data;

    // 2. 平滑进度动画：从 10% 慢慢增长到 90%
    let currentProgress = 10;
    const progressInterval = setInterval(() => {
      if (currentProgress < 90) {
        const increment = currentProgress < 50 ? 3 : currentProgress < 70 ? 2 : 1;
        currentProgress = Math.min(currentProgress + increment, 90);
        store.updateTaskProgress(taskId, currentProgress, 0, 0);
      }
    }, 300);

    // 3. 使用 XMLHttpRequest 直接上传到 R2（支持真实进度）
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 80 + 10; // 10-90%
          clearInterval(progressInterval); // 有真实进度后停止模拟
          store.updateTaskProgress(taskId, percentComplete, e.loaded, 0);
        }
      });

      xhr.addEventListener('load', () => {
        console.log('Upload complete, status:', xhr.status);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          console.error('Upload failed with status:', xhr.status, xhr.responseText);
          reject(new Error(`上传失败: HTTP ${xhr.status} - ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', (e) => {
        console.error('XHR error event:', e);
        console.error('XHR status:', xhr.status);
        console.error('XHR readyState:', xhr.readyState);
        reject(new Error('网络错误：可能是 CORS 配置问题或网络连接失败'));
      });

      xhr.addEventListener('abort', () => {
        console.warn('Upload aborted');
        reject(new Error('上传被取消'));
      });

      console.log('Starting upload to:', uploadUrl.substring(0, 100) + '...');
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });

    clearInterval(progressInterval);
    store.updateTaskProgress(taskId, 90, 0, 0);

    // 4. 保存视频记录到数据库
    const saveResult = await saveVideoRecordAction({
      collectionId,
      fileName: file.name,
      r2Key,
      fileSize: file.size,
      mimeType: file.type,
    });

    if (!saveResult.success) {
      throw new Error(saveResult.error || '保存视频记录失败');
    }

    // 5. 完成
    store.updateTaskProgress(taskId, 100, file.size, 0);
    store.updateTaskStatus(taskId, 'success');
    toast.success(`视频 "${task.fileName}" 上传成功`);
    
    // 刷新页面数据
    router.refresh();
    
    // 5秒后自动移除成功的任务
    setTimeout(() => {
      store.removeTask(taskId);
    }, 5000);
    
  } catch (error: any) {
    console.error('上传失败:', error);
    store.updateTaskStatus(taskId, 'error', error.message || '上传失败');
    toast.error(`上传失败: ${error.message}`);
  }
};

export function UploadVideoDialog({ collectionId }: UploadVideoDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 检查文件大小：1GB = 1024 * 1024 * 1024 bytes
      const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error(`文件太大！最大支持 1GB，当前文件: ${(selectedFile.size / (1024 * 1024 * 1024)).toFixed(2)}GB`);
        e.target.value = ''; // 清空文件选择
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      // 添加到 Zustand store
      const taskId = videoUploadTaskStore.getState().addTask({
        collectionId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      // 关闭对话框
      setOpen(false);
      setFile(null);
      toast.success('已添加上传任务，正在后台上传...');

      // 开始后台上传
      uploadTaskInBackground(taskId, file, collectionId, router);
    } catch (error: any) {
      console.error('添加上传任务失败:', error);
      toast.error(error.message || '添加上传任务失败');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={styles.trigger}>
          <Upload className={styles.triggerIcon} />
          上传视频
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>上传视频</DialogTitle>
          <DialogDescription>
            选择视频文件上传到此视频集
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <Label htmlFor="video-file">选择视频 *</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className={styles.fileInfo}>
                  已选择: {file.name} ({formatBytes(file.size)})
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!file}>
              <Upload className={styles.triggerIcon} />
              开始上传
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
