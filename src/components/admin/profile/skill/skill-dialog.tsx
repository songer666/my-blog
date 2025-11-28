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
import { SkillForm } from './skill-form';
import { FolderPlus, Plus, Trash2 } from 'lucide-react';
import { useSkillAPI } from '@/client/profile/skill-api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { SkillCategoryType, SkillType } from '@/server/types/profile-type';

interface SkillDialogProps {
  mode: 'create-category' | 'create-skill' | 'edit-category' | 'edit-skill' | 'delete-category' | 'delete-skill';
  categories?: (SkillCategoryType & { skills?: SkillType[] })[];
  categoryData?: SkillCategoryType;
  skillData?: SkillType;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function SkillDialog({ 
  mode,
  categories = [],
  categoryData,
  skillData,
  trigger,
  triggerClassName 
}: SkillDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { useDeleteSkillCategory, useDeleteSkill } = useSkillAPI();
  const deleteCategoryMutation = useDeleteSkillCategory();
  const deleteSkillMutation = useDeleteSkill();
  const router = useRouter();

  // 处理创建成功
  const handleCreateSuccess = () => {
    setOpen(false);
    const itemType = (mode === 'edit-category' || mode === 'create-category') ? '分类' : '技能';
    toast.success(`${itemType}添加成功`, { position: 'top-center' });
    router.refresh();
  };

  // 处理删除分类
  const handleDeleteCategory = async () => {
    if (!categoryData?.id) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteCategoryMutation.mutateAsync({ id: categoryData.id });
      
      if (result.success) {
        toast.success("技能分类删除成功", { position: 'top-center' });
        router.refresh();
      } else {
        toast.error("删除失败", { position: 'top-center' });
      }
    } catch (error: any) {
      console.error('删除技能分类失败:', error);
      toast.error('删除过程中发生错误', { position: 'top-center' });
    } finally {
      setIsDeleting(false);
    }
  };

  // 处理删除技能
  const handleDeleteSkill = async () => {
    if (!skillData?.id) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteSkillMutation.mutateAsync({ id: skillData.id });
      
      if (result.success) {
        toast.success("技能删除成功", { position: 'top-center' });
        router.refresh();
      } else {
        toast.error("删除失败", { position: 'top-center' });
      }
    } catch (error: any) {
      console.error('删除技能失败:', error);
      toast.error('删除过程中发生错误', { position: 'top-center' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  // 创建分类模式的触发器
  const createCategoryTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={triggerClassName}
    >
      {trigger || (
        <>
          <FolderPlus className="size-4 mr-2" />
          添加分类
        </>
      )}
    </Button>
  );

  // 创建技能模式的触发器
  const createSkillTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={triggerClassName}
    >
      {trigger || (
        <>
          <Plus className="size-4 mr-2" />
          添加技能
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
      {trigger || <Trash2 className="size-4" />}
    </Button>
  );

  // 创建分类模式
  if (mode === 'create-category' || mode === 'edit-category') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {createCategoryTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="size-5" />
              添加技能分类
            </DialogTitle>
            <DialogDescription>
              创建一个新的技能分类，用于组织和管理相关技能。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <SkillForm
              mode="category"
              categories={categories}
              onSuccess={handleCreateSuccess}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 创建技能模式
  if (mode === 'create-skill' || mode === 'edit-skill') {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {createSkillTrigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="size-5" />
              添加技能
            </DialogTitle>
            <DialogDescription>
              在现有分类下添加一个新的技能项目。
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <SkillForm
              mode="skill"
              categories={categories}
              onSuccess={handleCreateSuccess}
              onCancel={handleCancel}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // 删除分类模式
  if (mode === 'delete-category') {
    const skillCount = categoryData ? 
      categories.find(cat => cat.id === categoryData.id)?.skills?.length || 0 : 0;

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {deleteTrigger}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" />
              删除技能分类
            </AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除 <strong>{categoryData?.name}</strong> 分类吗？
              {skillCount > 0 && (
                <span className="text-destructive font-medium">
                  <br />该分类下有 {skillCount} 个技能，删除分类会同时删除所有技能。
                </span>
              )}
              <br />此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
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

  // 删除技能模式
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {deleteTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            删除技能
          </AlertDialogTitle>
          <AlertDialogDescription>
            确定要删除技能 <strong>{skillData?.name}</strong> 吗？此操作无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteSkill}
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
