"use client";

import React from 'react'
import { TagDialog } from "./tag-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TagType } from "@/server/types/blog-type";

interface TagDialogWrapperProps {
  mode?: 'create' | 'edit' | 'delete';
  tag?: TagType;
  children?: React.ReactNode;
}

export function TagDialogWrapper({ mode = 'create', tag, children }: TagDialogWrapperProps) {
  const router = useRouter();

  const handleTagAction = () => {
    // 标签操作成功后的逻辑
    let message = '标签列表已更新';
    let description = '页面将自动刷新以显示最新数据';
    
    if (mode === 'edit') {
      message = '标签信息已更新';
      description = '标签信息更新成功，页面将自动刷新';
    } else if (mode === 'delete') {
      message = '标签已删除';
      description = '标签删除成功，页面将自动刷新';
    } else {
      description = '页面将自动刷新以显示新标签';
    }
      
    toast.success(message, { 
      position: 'top-center',
      description
    });
    
    // 刷新页面数据
    router.refresh();
  };

  return (
    <TagDialog
      onTagAction={handleTagAction}
      mode={mode}
      tag={tag}
    >
      {children}
    </TagDialog>
  );
}
