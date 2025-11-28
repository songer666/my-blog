"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { EducationType, EducationUpdateType } from "@/server/types/profile-type";

/**
 * 教育经历 API 封装
 * 包含所有教育经历相关的后端调用和用户反馈
 */
export function useEducateAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 新增教育经历 - 包含完整的错误处理和用户反馈
     */
    useCreateEducation: () => useMutation({
      ...trpc.educate.create.mutationOptions(),
      onSuccess: (data) => {
        toast.success('教育经历添加成功', {
          position: 'top-center',
          description: '您的教育背景已成功添加'
        });
      },
      onError: (error: any) => {
        console.error('添加教育经历错误:', error);
        toast.error('教育经历添加失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除教育经历 - 包含完整的错误处理和用户反馈
     */
    useDeleteEducation: () => useMutation({
      ...trpc.educate.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('教育经历删除成功', {
          position: 'top-center',
          description: '教育经历已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除教育经历错误:', error);
        toast.error('教育经历删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 教育经历业务逻辑封装
 */
export function useEducateOperations() {
  const { useCreateEducation, useDeleteEducation } = useEducateAPI();
  const createEducationMutation = useCreateEducation();
  const deleteEducationMutation = useDeleteEducation();

  return {
    /**
     * 创建教育经历的便捷方法
     */
    createEducation: async (data: EducationUpdateType) => {
      return await createEducationMutation.mutateAsync(data);
    },

    /**
     * 删除教育经历的便捷方法
     */
    deleteEducation: async (id: string) => {
      return await deleteEducationMutation.mutateAsync({ id });
    },

    /**
     * 获取加载状态
     */
    isLoading: createEducationMutation.isPending || deleteEducationMutation.isPending,

    /**
     * 重置所有状态
     */
    reset: () => {
      createEducationMutation.reset();
      deleteEducationMutation.reset();
    }
  };
}

/**
 * 验证学校 logo 文件类型和大小
 */
export function validateSchoolLogoFile(file: File): { valid: boolean; message?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '只支持 JPEG、PNG、WebP 格式的图片',
    };
  }

  // 检查文件大小 (1MB，logo通常更小)
  const maxSize = 1 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: '图片大小不能超过 1MB',
    };
  }

  return { valid: true };
}

