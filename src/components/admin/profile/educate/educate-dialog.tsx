'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { EducateForm } from './educate-form';
import { Plus, Trash2 } from 'lucide-react';
import { useEducateOperations } from '@/client/profile/educate-api';
import { useRouter } from 'next/navigation';

interface EducateDialogProps {
  mode?: 'create' | 'delete';
  educationId?: string;
  educationName?: string;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function EducateDialog({ 
  mode = 'create',
  educationId,
  educationName,
  trigger,
  triggerClassName 
}: EducateDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { deleteEducation } = useEducateOperations();
  const router = useRouter();

  // 处理新增成功
  const handleCreateSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  // 处理删除
  const handleDelete = async () => {
    if (!educationId) return;
    
    try {
      setIsDeleting(true);
      await deleteEducation(educationId);
      router.refresh();
    } catch (error: any) {
      // 错误处理已经在 API 层完成
      console.error('删除教育经历失败:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // 新增模式的触发器
  const createTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={triggerClassName}
    >
      {trigger || (
        <>
          <Plus className="size-4 mr-2" />
          添加教育经历
        </>
      )}
    </Button>
  );

  // 删除模式的触发器
  const deleteTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      <Trash2 className="size-4" />
    </Button>
  );

  // 新增模式
  if (mode === 'create') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {createTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              添加教育经历
            </DialogTitle>
            <DialogDescription>
              添加您的教育背景信息，包括学校、学院、专业、学位等。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <EducateForm
              onSuccess={handleCreateSuccess}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 删除模式
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {deleteTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            删除教育经历
          </AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除 <strong>{educationName}</strong> 的教育经历吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>删除中...</span>
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
