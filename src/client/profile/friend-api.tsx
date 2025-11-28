"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { FriendType, FriendUpdateType } from "@/server/types/profile-type";

/**
 * 友链 API 封装
 * 包含所有友链相关的后端调用和用户反馈
 */
export function useFriendAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 新增友链 - 包含完整的错误处理和用户反馈
     */
    useCreateFriend: () => useMutation({
      ...trpc.friend.create.mutationOptions(),
      onSuccess: (data) => {
        toast.success('友链添加成功', {
          position: 'top-center',
          description: '友情链接已成功添加'
        });
      },
      onError: (error: any) => {
        console.error('添加友链错误:', error);
        toast.error('友链添加失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除友链 - 包含完整的错误处理和用户反馈
     */
    useDeleteFriend: () => useMutation({
      ...trpc.friend.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('友链删除成功', {
          position: 'top-center',
          description: '友情链接已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除友链错误:', error);
        toast.error('友链删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 获取单个友链的 query hook
     */
    useGetFriendById: () => trpc.friend.getById,
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 友链业务逻辑封装
 */
export function useFriendOperations() {
  const { useCreateFriend, useDeleteFriend } = useFriendAPI();
  const createFriendMutation = useCreateFriend();
  const deleteFriendMutation = useDeleteFriend();

  return {
    /**
     * 获取加载状态
     */
    isLoading: createFriendMutation.isPending || deleteFriendMutation.isPending,

    /**
     * 重置所有状态
     */
    reset: () => {
      createFriendMutation.reset();
      deleteFriendMutation.reset();
    }
  };
}

/**
 * 验证友链头像文件类型和大小
 */
export function validateFriendAvatarFile(file: File): { valid: boolean; message?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '只支持 JPEG、PNG、WebP 格式的图片',
    };
  }

  // 检查文件大小 (1MB)
  const maxSize = 1 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: '头像大小不能超过 1MB',
    };
  }

  return { valid: true };
}

/**
 * 验证友链 URL 格式
 */
export function validateFriendUrl(url: string): { valid: boolean; message?: string } {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      message: 'URL 格式不正确',
    };
  }
}

/**
 * 从 URL 中提取域名作为默认名称
 */
export function extractNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * 生成友链的显示颜色
 */
export function getFriendDisplayColor(name: string): string {
  // 根据名称生成一致的颜色
  const colors = [
    '#3B82F6', // blue
    '#10B981', // emerald
    '#8B5CF6', // violet
    '#F59E0B', // amber
    '#EF4444', // red
    '#06B6D4', // cyan
    '#84CC16', // lime
    '#F97316', // orange
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}
