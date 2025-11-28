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
import { FriendForm } from './friend-form';
import { Plus, X } from 'lucide-react';
import { useFriendAPI } from '@/client/profile/friend-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FriendType } from '@/server/types/profile-type';

interface FriendDialogProps {
  mode?: 'create' | 'delete';
  friendData?: FriendType;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function FriendDialog({ 
  mode = 'create',
  friendData,
  trigger,
  triggerClassName 
}: FriendDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { useDeleteFriend } = useFriendAPI();
  const deleteFriendMutation = useDeleteFriend();
  const router = useRouter();

  // 处理新增成功
  const handleCreateSuccess = () => {
    setOpen(false);
    toast.success("友链添加成功", { position: 'top-center' });
    router.refresh();
  };

  // 处理删除
  const handleDelete = async () => {
    if (!friendData?.id) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteFriendMutation.mutateAsync({ id: friendData.id });
      
      if (result.success) {
        toast.success("友链删除成功", { position: 'top-center' });
        router.refresh();
      } else {
        toast.error("删除失败", { position: 'top-center' });
      }
    } catch (error: any) {
      console.error('删除友链失败:', error);
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
          添加友链
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
      <X className="size-4" />
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
              添加友链
            </DialogTitle>
            <DialogDescription>
              添加一个友情链接，与其他网站或博客建立联系。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <FriendForm
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
            <X className="size-5 text-destructive" />
            删除友链
          </AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除友链 <strong>{friendData?.name}</strong> 吗？此操作无法撤销。
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
