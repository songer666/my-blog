"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { PostEditForm } from './post-edit-form';
import { PostWithTagsType, TagType } from '@/server/types/blog-type';

interface PostEditWrapperProps {
  mode: 'create' | 'edit';
  initialData?: PostWithTagsType;
  availableTags: TagType[];
  availableRepositories: Array<{ id: string; title: string; slug: string }>;
}

export function PostEditWrapper({ mode, initialData, availableTags, availableRepositories }: PostEditWrapperProps) {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    // 成功后跳转到文章列表
    router.push('/admin/dashboard/blog');
  };

  const handleCancel = () => {
    // 取消后返回文章列表
    router.push('/admin/dashboard/blog');
  };

  return (
    <PostEditForm
      mode={mode}
      initialData={initialData}
      availableTags={availableTags}
      availableRepositories={availableRepositories}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
