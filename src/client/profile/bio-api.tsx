"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { BioUpdateType } from "@/server/types/profile-type";

/**
 * 个人资料 API 封装
 * 包含所有个人资料相关的后端调用和用户反馈
 */
export function useBioAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 更新个人基本信息 - 包含完整的错误处理和用户反馈
     */
    useUpdateBio: () => useMutation({
      ...trpc.bio.update.mutationOptions(),
      onSuccess: (data) => {
        toast.success('个人资料更新成功', {
          position: 'top-center',
          description: '您的个人信息已成功更新'
        });
      },
      onError: (error: any) => {
        console.error('更新个人资料错误:', error);
        toast.error('个人资料更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
  };
}

/**
 * 个人资料业务逻辑封装
 */
export function useBioOperations() {
  const { useUpdateBio } = useBioAPI();
  const updateBioMutation = useUpdateBio();

  return {
    /**
     * 更新个人资料的便捷方法
     */
    updateBio: async (data: BioUpdateType) => {
      return await updateBioMutation.mutateAsync(data);
    },

    /**
     * 获取加载状态
     */
    isLoading: updateBioMutation.isPending,

    /**
     * 重置状态
     */
    reset: () => {
      updateBioMutation.reset();
    }
  };
}

/**
 * 验证文件类型和大小
 */
export function validateAvatarFile(file: File): { valid: boolean; message?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '只支持 JPEG、PNG、WebP 格式的图片',
    };
  }

  // 检查文件大小 (2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: '图片大小不能超过 2MB',
    };
  }

  return { valid: true };
}
