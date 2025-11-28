"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/ui/dialog';
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
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { TagEditForm } from './tag-edit-form';
import { useTagOperations } from '@/client/blog/tag-api';
import { TagType } from '@/server/types/blog-type';
import styles from './tag-dialog.module.css';

interface TagDialogProps {
  children?: React.ReactNode;
  onTagAction?: () => void;
  mode?: 'create' | 'edit' | 'delete';
  tag?: TagType;
}

export function TagDialog({ children, onTagAction, mode = 'create', tag }: TagDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteTag } = useTagOperations();
  
  const isEditMode = mode === 'edit';
  const isDeleteMode = mode === 'delete';

  const handleSuccess = () => {
    // 关闭对话框
    setOpen(false);
    
    // 调用父组件的回调函数
    if (onTagAction) {
      onTagAction();
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!tag?.id) return;
    
    try {
      setIsDeleting(true);
      await deleteTag(tag.id);
      
      // 关闭对话框
      setOpen(false);
      
      // 调用父组件的回调函数
      if (onTagAction) {
        onTagAction();
      }
    } catch (error: any) {
      // 错误处理已经在 API 层完成
      console.error('删除标签错误:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // 删除模式使用 AlertDialog
  if (isDeleteMode) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          {children || (
            <Button variant="outline" size="sm" className={styles.triggerButtonOutline}>
              <Trash2 className={styles.buttonIconSmall} />
              删除
            </Button>
          )}
        </AlertDialogTrigger>
        
        <AlertDialogContent className={styles.alertContent}>
          <AlertDialogHeader>
            <AlertDialogTitle className={styles.alertTitle}>
              <Trash2 className={styles.alertIcon} />
              确认删除标签
            </AlertDialogTitle>
            <AlertDialogDescription className={styles.alertDescription}>
              您确定要删除标签 <span className={styles.tagName}>"{tag?.name}"</span> 吗？
              <br />
              <span className={styles.warningText}>此操作不可撤销，相关的文章标签关联也会被删除。</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className={styles.deleteButton}
            >
              {isDeleting ? (
                <span className={styles.loadingContent}>
                  <Spinner className={styles.spinner} aria-hidden="true" />
                  删除中...
                </span>
              ) : (
                <>
                  <Trash2 className={styles.buttonIconSmall} />
                  确认删除
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // 创建和编辑模式使用 Dialog
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={styles.triggerButton}>
            {isEditMode ? (
              <>
                <Edit className={styles.buttonIconMedium} />
                编辑标签
              </>
            ) : (
              <>
                <Plus className={styles.buttonIconMedium} />
                添加标签
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>
            {isEditMode ? (
              <>
                <Edit className={styles.buttonIconLarge} />
                编辑标签
              </>
            ) : (
              <>
                <Plus className={styles.buttonIconLarge} />
                创建新标签
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className={styles.dialogBody}>
          <p className={styles.dialogDescription}>
            {isEditMode 
              ? '修改标签的名称信息。'
              : '填写标签名称来创建新标签。'
            }
          </p>
          
          <TagEditForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            mode={mode}
            tag={tag}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}