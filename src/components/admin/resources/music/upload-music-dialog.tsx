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
import { Alert, AlertDescription } from "@/components/shadcn/ui/alert";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Upload, Info } from "lucide-react";
import { useMusicAlbumAPI, musicAlbumUtils } from "@/client/resources/music-api";
import { parseBlob } from "music-metadata-browser";
import { toast } from "sonner";
import { useMusicUploadTaskStore, musicUploadTaskStore } from "@/store/musicUpload/store";

const styles = {
  dialogContent: `sm:max-w-[500px]`.trim(),
  formContainer: `grid gap-4 py-4`.trim(),
  fieldContainer: `grid gap-2`.trim(),
  uploadIcon: `h-4 w-4 mr-2`.trim(),
  infoIcon: `h-4 w-4`.trim(),
  fileInfo: `text-sm text-muted-foreground`.trim(),
  hint: `text-xs text-muted-foreground`.trim(),
};

interface UploadMusicDialogProps {
  albumId: string;
}

// 后台上传任务处理函数 - 前端直接上传到 R2
const uploadTaskInBackground = async (taskId: string, file: File, albumId: string, router: any) => {
  const store = musicUploadTaskStore.getState();
  
  try {
    // 更新状态为上传中
    store.updateTaskStatus(taskId, 'uploading');
    store.updateTaskProgress(taskId, 0, 0, 0);

    // 获取任务信息
    const task = store.tasks.find(t => t.id === taskId);
    if (!task) throw new Error('任务不存在');

    // 解析元数据
    let duration: number | undefined;
    let bitrate: number | undefined;
    try {
      const metadata = await parseBlob(file);
      duration = metadata.format.duration;
      bitrate = metadata.format.bitrate;
    } catch (error) {
      console.warn('无法解析音频元数据:', error);
    }

    // 动态导入 Server Actions
    const { getMusicUploadUrlAction, saveMusicRecordAction } = await import('@/server/actions/resources/r2-action');
    
    // 1. 获取预签名上传 URL
    store.updateTaskProgress(taskId, 5, 0, 0);
    const urlResult = await getMusicUploadUrlAction({
      albumId,
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
    let lastLoaded = 0;
    let lastTime = Date.now();
    
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 80 + 10; // 10-90%
          clearInterval(progressInterval); // 有真实进度后停止模拟
          
          // 计算上传速度
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000; // 转为秒
          const bytesDiff = e.loaded - lastLoaded;
          const speed = timeDiff > 0 ? bytesDiff / timeDiff : 0;
          
          lastLoaded = e.loaded;
          lastTime = now;
          
          store.updateTaskProgress(taskId, percentComplete, e.loaded, speed);
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
    store.updateTaskProgress(taskId, 90, file.size, 0);

    // 4. 保存音乐记录到数据库
    const saveResult = await saveMusicRecordAction({
      albumId,
      fileName: file.name,
      r2Key,
      fileSize: file.size,
      mimeType: file.type,
      artist: task.artist,
      duration,
      bitrate,
    });

    if (!saveResult.success) {
      throw new Error(saveResult.error || '保存音乐记录失败');
    }

    // 5. 完成
    store.updateTaskProgress(taskId, 100, file.size, 0);
    store.updateTaskStatus(taskId, 'success');
    toast.success(`音乐 "${task.fileName}" 上传成功`);
    
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

export function UploadMusicDialog({ albumId }: UploadMusicDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [artistName, setArtistName] = useState("");

  // 使用原子选择器避免重渲染
  const addTask = useMusicUploadTaskStore(state => state.addTask);
  const allTasks = useMusicUploadTaskStore(state => state.tasks);
  
  // 在组件中计算，避免selector返回新数组导致重渲染
  const activeTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'uploading');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!musicAlbumUtils.isValidAudioFile(selectedFile)) {
      toast.error('请选择有效的音频文件');
      return;
    }

    setFile(selectedFile);

    // 尝试解析音频元数据
    try {
      const metadata = await parseBlob(selectedFile);
      if (metadata.common.artist) {
        setArtistName(metadata.common.artist);
      }
    } catch (error) {
      console.warn('无法解析音频元数据:', error);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('请选择音频文件');
      return;
    }

    try {
      // 解析音频元数据
      let duration: number | undefined;
      let title: string | undefined;
      let album: string | undefined;
      
      try {
        const metadata = await parseBlob(file);
        duration = metadata.format.duration;
        title = metadata.common.title || file.name;
        album = metadata.common.album;
      } catch (error) {
        console.warn('无法解析音频元数据:', error);
        title = file.name;
      }

      // 添加任务到 zustand store
      const taskId = addTask({
        albumId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        duration,
        title,
        artist: artistName || undefined,
        album,
      });

      // 关闭对话框
      setOpen(false);
      setFile(null);
      setArtistName('');
      toast.success('已添加上传任务，正在后台上传...');

      // 开始后台上传
      uploadTaskInBackground(taskId, file, albumId, router);
    } catch (error: any) {
      console.error('添加上传任务失败:', error);
      toast.error(error.message || '添加上传任务失败');
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={setOpen}
      modal={true}
    >
      <DialogTrigger asChild>
        <Button>
          <Upload className={styles.uploadIcon} />
          上传音乐
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.dialogContent}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>上传音乐</DialogTitle>
            <DialogDescription>
              选择要上传到此专辑的音频文件
            </DialogDescription>
          </DialogHeader>

          <div className={styles.formContainer}>
            {/* 后台上传提示 */}
            {activeTasks.length > 0 && (
              <Alert>
                <Info className={styles.infoIcon} />
                <AlertDescription>
                  当前有 {activeTasks.length} 个音乐文件正在后台上传，你可以关闭此对话框，上传会继续进行。
                </AlertDescription>
              </Alert>
            )}

            <div className={styles.fieldContainer}>
              <Label htmlFor="music-file">选择音频 *</Label>
              <Input
                id="music-file"
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                required
              />
              {file && (
                <p className={styles.fileInfo}>
                  已选择: {file.name} ({formatBytes(file.size)})
                </p>
              )}
            </div>

            <div className={styles.fieldContainer}>
              <Label htmlFor="artist">艺术家</Label>
              <Input
                id="artist"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="艺术家姓名"
              />
              <p className={styles.hint}>
                可选，如果文件包含元数据会自动填充
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={!file}
            >
              <Upload className={styles.uploadIcon} />
              开始上传
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
