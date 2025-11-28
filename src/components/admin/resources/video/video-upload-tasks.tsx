"use client";

import { useMemo } from "react";
import { videoUploadTaskStore } from "@/store/videoUpload/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Progress } from "@/components/shadcn/ui/progress";
import { Button } from "@/components/shadcn/ui/button";
import { X, CheckCircle2, AlertCircle } from "lucide-react";

const styles = {
  container: `space-y-3`.trim(),
  card: ``.trim(),
  cardHeader: `flex flex-row items-center justify-between space-y-0 pb-3`.trim(),
  cardTitle: `text-sm font-medium`.trim(),
  closeButton: `h-8 w-8`.trim(),
  closeIcon: `h-4 w-4`.trim(),
  cardContent: `space-y-2`.trim(),
  progressBar: ``.trim(),
  progressInfo: `flex items-center justify-between text-sm`.trim(),
  speedInfo: `text-xs text-muted-foreground`.trim(),
  successMessage: `text-sm text-green-600`.trim(),
  errorMessage: `text-sm text-destructive`.trim(),
};

interface VideoUploadTasksProps {
  collectionId: string;
}

export function VideoUploadTasks({ collectionId }: VideoUploadTasksProps) {
  const allTasks = videoUploadTaskStore((state) => state.tasks);
  
  const tasks = useMemo(() => {
    return allTasks.filter(t => t.collectionId === collectionId);
  }, [allTasks, collectionId]);

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

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {tasks.map((task) => (
        <Card key={task.id} className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <div className="flex items-center gap-2">
              {task.status === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {task.status === 'error' && <AlertCircle className="h-4 w-4 text-destructive" />}
              <CardTitle className={styles.cardTitle}>{task.fileName}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={styles.closeButton}
              onClick={() => videoUploadTaskStore.getState().removeTask(task.id)}
            >
              <X className={styles.closeIcon} />
            </Button>
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
