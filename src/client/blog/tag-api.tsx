"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { TagType, TagUpdateType } from "@/server/types/blog-type";

/**
 * 博客标签 API 封装
 * 包含所有标签相关的后端调用和用户反馈
 */
export function useBlogAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建标签 - 包含完整的错误处理和用户反馈
     */
    useCreateTag: () => useMutation({
      ...trpc.tag.create.mutationOptions(),
      onSuccess: (data) => {
        toast.success('标签创建成功', {
          position: 'top-center',
          description: `标签 ${data.data?.name} 已成功创建`
        });
      },
      onError: (error: any) => {
        console.error('创建标签错误:', error);
        toast.error('标签创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新标签 - 包含完整的错误处理和用户反馈
     */
    useUpdateTag: () => useMutation({
      ...trpc.tag.update.mutationOptions(),
      onSuccess: (data) => {
        toast.success('标签更新成功', {
          position: 'top-center',
          description: `标签 ${data.data?.name} 已成功更新`
        });
      },
      onError: (error: any) => {
        console.error('更新标签错误:', error);
        toast.error('标签更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除标签 - 包含完整的错误处理和用户反馈
     */
    useDeleteTag: () => useMutation({
      ...trpc.tag.delete.mutationOptions(),
      onSuccess: (_, variables) => {
        toast.success('标签删除成功', {
          position: 'top-center',
          description: '标签已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除标签错误:', error);
        toast.error('标签删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 获取标签的 query hook
     */
    useGetTagById: () => trpc.tag.getById,
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 标签业务逻辑封装
 * 提供高级的标签操作方法
 */
export function useTagOperations() {
  const { useCreateTag, useUpdateTag, useDeleteTag } = useBlogAPI();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();
  const deleteTagMutation = useDeleteTag();

  return {
    /**
     * 创建标签的便捷方法
     */
    createTag: async (data: TagUpdateType) => {
      return await createTagMutation.mutateAsync(data);
    },

    /**
     * 更新标签的便捷方法
     */
    updateTag: async (id: string, data: TagUpdateType) => {
      return await updateTagMutation.mutateAsync({ id, data });
    },

    /**
     * 删除标签的便捷方法
     */
    deleteTag: async (id: string) => {
      return await deleteTagMutation.mutateAsync({ id });
    },

    /**
     * 获取加载状态
     */
    isLoading: createTagMutation.isPending || updateTagMutation.isPending || deleteTagMutation.isPending,

    /**
     * 重置所有状态
     */
    reset: () => {
      createTagMutation.reset();
      updateTagMutation.reset();
      deleteTagMutation.reset();
    }
  };
}

/**
 * 验证标签名称
 */
export function validateTagName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      message: '标签名称不能为空',
    };
  }

  if (name.length > 50) {
    return {
      valid: false,
      message: '标签名称不能超过50个字符',
    };
  }

  return { valid: true };
}

/**
 * 标签工具函数
 */
export const tagUtils = {
  /**
   * 格式化标签显示名称
   */
  formatTagName: (name: string): string => {
    return name.trim().replace(/\s+/g, ' ');
  },

  /**
   * 检查标签名称是否有效
   */
  isValidTagName: (name: string): boolean => {
    return validateTagName(name).valid;
  },

  /**
   * 生成标签的显示颜色（基于名称哈希）
   */
  getTagColor: (name: string): string => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash + name.charCodeAt(i)) & 0xffffffff;
    }
    
    return colors[Math.abs(hash) % colors.length];
  }
};
