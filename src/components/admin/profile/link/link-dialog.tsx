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
import { LinkForm } from './link-form';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useLinkAPI } from '@/client/profile/link-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SocialLinkType } from '@/server/types/profile-type';

interface LinkDialogProps {
  mode?: 'create' | 'update' | 'delete';
  socialLinkData?: SocialLinkType;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function LinkDialog({ 
  mode = 'create',
  socialLinkData,
  trigger,
  triggerClassName 
}: LinkDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { useDeleteSocialLink } = useLinkAPI();
  const deleteSocialLinkMutation = useDeleteSocialLink();
  const router = useRouter();

  // 处理新增/更新成功
  const handleFormSuccess = () => {
    setOpen(false);
    toast.success(`社交链接${mode === 'create' ? '添加' : '更新'}成功`, { 
      position: 'top-center' 
    });
    router.refresh();
  };

  // 处理删除
  const handleDelete = async () => {
    if (!socialLinkData?.id) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteSocialLinkMutation.mutateAsync({ id: socialLinkData.id });
      
      if (result.success) {
        toast.success("社交链接删除成功", { position: 'top-center' });
        router.refresh();
      } else {
        toast.error("删除失败", { position: 'top-center' });
      }
    } catch (error: any) {
      console.error('删除社交链接失败:', error);
      toast.error('删除过程中发生错误', { position: 'top-center' });
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
          添加社交链接
        </>
      )}
    </Button>
  );

  // 编辑模式的触发器
  const updateTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
    >
      {trigger || <Edit className="size-4" />}
    </Button>
  );

  // 删除模式的触发器
  const deleteTrigger = (
    <Button
      variant="ghost"
      size="sm"
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
    >
      {trigger || <Trash2 className="size-4" />}
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
              添加社交链接
            </DialogTitle>
            <DialogDescription>
              添加您的社交媒体或个人网站链接，让访客更好地了解和联系您。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <LinkForm
              mode="create"
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 编辑模式
  if (mode === 'update') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {updateTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="size-5" />
              编辑社交链接
            </DialogTitle>
            <DialogDescription>
              修改 <strong>{socialLinkData?.platform}</strong> 的链接信息。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <LinkForm
              mode="update"
              initialData={socialLinkData}
              onSuccess={handleFormSuccess}
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
            删除社交链接
          </AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除 <strong>{socialLinkData?.platform}</strong> 的社交链接吗？此操作无法撤销。
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
