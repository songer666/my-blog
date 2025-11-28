"use client";

import { useMemo } from "react";
import { useMusicUploadTaskStore } from "@/store/musicUpload/store";
import type { MusicUploadTask } from "@/store/musicUpload/type";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Progress } from "@/components/shadcn/ui/progress";
import { Button } from "@/components/shadcn/ui/button";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const styles = {
  container: `space-y-4`.trim(),
  headerRow: `flex items-center justify-between`.trim(),
  statusRow: `flex items-center gap-2`.trim(),
  statusIcon: `h-4 w-4`.trim(),
  iconUploading: `h-4 w-4 animate-spin text-blue-500`.trim(),
  iconSuccess: `h-4 w-4 text-green-500`.trim(),
  iconError: `h-4 w-4 text-red-500`.trim(),
  fileName: `text-sm`.trim(),
  closeIcon: `h-4 w-4`.trim(),
  cardContent: `space-y-3`.trim(),
  progressBar: `h-2`.trim(),
  progressInfo: `flex justify-between text-sm text-muted-foreground`.trim(),
  speedInfo: `text-sm text-muted-foreground`.trim(),
  successMessage: `text-sm text-green-600`.trim(),
  errorMessage: `text-sm text-red-600`.trim(),
};

interface MusicUploadTasksProps {
  albumId: string;
}

export function MusicUploadTasks({ albumId }: MusicUploadTasksProps) {
  // 获取所有任务
  const allTasks = useMusicUploadTaskStore(state => state.tasks);
  const removeTask = useMusicUploadTaskStore(state => state.removeTask);
  
  // 使用 useMemo 缓存过滤结果，避免无限循环
  const tasks = useMemo(() => {
    return allTasks.filter(t => t.albumId === albumId);
  }, [allTasks, albumId]);

  if (tasks.length === 0) return null;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  return (
    <div className={styles.container}>
      {tasks.map((task: MusicUploadTask) => (
        <Card key={task.id}>
          <CardHeader>
            <div className={styles.headerRow}>
              <div className={styles.statusRow}>
                {task.status === 'uploading' && <Loader2 className={styles.iconUploading} />}
                {task.status === 'success' && <CheckCircle className={styles.iconSuccess} />}
                {task.status === 'error' && <AlertCircle className={styles.iconError} />}
                <CardTitle className={styles.fileName}>{task.fileName}</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeTask(task.id)}
                disabled={task.status === 'uploading'}
              >
                <X className={styles.closeIcon} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className={styles.cardContent}>
            {task.status === 'uploading' && (
              <>
                <Progress value={task.progress} className={styles.progressBar} />
                <div className={styles.progressInfo}>
                  <span>
                    {task.progress >= 95 ? '正在处理...' : `${task.progress.toFixed(1)}%`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatBytes(task.uploadedBytes)} / {formatBytes(task.fileSize)}
                  </span>
                </div>
                {task.uploadSpeed > 0 && task.progress < 95 && (
                  <div className={styles.speedInfo}>
                    上传速度: {formatSpeed(task.uploadSpeed)}
                  </div>
                )}
                {task.progress >= 95 && (
                  <div className={styles.speedInfo}>
                    正在保存到数据库...
                  </div>
                )}
              </>
            )}
            {task.status === 'success' && (
              <p className={styles.successMessage}>上传成功！</p>
            )}
            {task.status === 'error' && (
              <p className={styles.errorMessage}>错误: {task.error}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
