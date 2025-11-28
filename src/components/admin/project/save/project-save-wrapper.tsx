"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProjectSaveForm } from './project-save-form';
import { ProjectType } from '@/server/types/project-type';

interface ProjectSaveWrapperProps {
  mode: 'create' | 'edit';
  initialData?: ProjectType;
}

export function ProjectSaveWrapper({ mode, initialData }: ProjectSaveWrapperProps) {
  const router = useRouter();

  const handleSuccess = (data: any) => {
    // 成功后跳转到项目详情页或管理首页
    if (data?.id) {
      router.push(`/admin/dashboard/project/${data.id}`);
    } else {
      router.push('/admin/dashboard');
    }
    router.refresh();
  };

  const handleCancel = () => {
    // 取消后返回管理首页
    router.push('/admin/dashboard');
  };

  return (
    <ProjectSaveForm
      mode={mode}
      initialData={initialData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}

