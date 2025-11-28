"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shadcn/ui/alert-dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { ProjectType } from '@/server/types/project-type';
import { useProjectOperations } from '@/client/project-api';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import styles from './project-delete.module.css';

interface ProjectDeleteProps {
  project: ProjectType;
  onSuccess?: () => void;
}

export function ProjectDelete({ project, onSuccess }: ProjectDeleteProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { deleteProject } = useProjectOperations();
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deleteProject(project.id);
      
      if (result.success) {
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        } else {
          // 默认跳转到管理后台首页
          router.push('/admin/dashboard');
          router.refresh();
        }
      }
    } catch (error) {
      console.error('删除项目失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(styles.deleteButton, "text-destructive hover:text-destructive cursor-pointer")}
        >
          <Trash2 className={styles.actionIcon} />
          删除
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className={styles.dialogContent}>
        <AlertDialogHeader>
          <div className={styles.header}>
            <div className={styles.iconContainer}>
              <AlertTriangle className={cn(styles.warningIcon, "text-destructive")} />
            </div>
            <div className={styles.headerContent}>
              <AlertDialogTitle className={styles.title}>
                确认删除项目
              </AlertDialogTitle>
              <AlertDialogDescription className={styles.description}>
                此操作无法撤销，项目将被永久删除。
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className={styles.content}>
          <div className={styles.projectInfo}>
            <div className={styles.projectInfoLabel}>即将删除的项目：</div>
            <div className={styles.projectDetails}>
              <div className={styles.projectTitle}>{project.title}</div>
              <div className={cn(styles.projectDescription, "text-muted-foreground line-clamp-2")}>
                {project.description}
              </div>
              <div className={cn(styles.projectUrl, "text-muted-foreground")}>
                URL: /{project.slug}
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter className={styles.footer}>
          <AlertDialogCancel disabled={isDeleting} className={styles.cancelButton}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className={cn(styles.confirmDeleteButton, "text-destructive-foreground")}
          >
            {isDeleting ? (
              <div className={styles.loadingContent}>
                <Spinner className={styles.loadingSpinner} />
                删除中...
              </div>
            ) : (
              '确认删除'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

