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
import { PostWithTagsType } from '@/server/types/blog-type';
import { usePostOperations } from '@/client/blog/post-api';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import styles from './blog-delete-dialog.module.css';

interface BlogDeleteDialogProps {
  post: PostWithTagsType;
  onSuccess?: () => void;
}

export function BlogDeleteDialog({ 
  post, 
  onSuccess 
}: BlogDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const { deletePost } = usePostOperations();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const result = await deletePost(post.id);
      
      if (result.success) {
        setOpen(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error('删除文章失败:', error);
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
                确认删除文章
              </AlertDialogTitle>
              <AlertDialogDescription className={styles.description}>
                此操作无法撤销，文章将被永久删除。
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className={styles.content}>
          <div className={styles.postInfo}>
            <div className={styles.postInfoLabel}>即将删除的文章：</div>
            <div className={styles.postDetails}>
              <div className={styles.postTitle}>{post.title}</div>
              <div className={cn(styles.postDescription, "text-muted-foreground line-clamp-2")}>
                {post.description}
              </div>
              <div className={cn(styles.postUrl, "text-muted-foreground")}>
                URL: /{post.slug}
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
