"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * 视频集 API 封装
 * 包含所有视频集相关的后端调用和用户反馈
 */
export function useVideoCollectionAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建视频集
     */
    useCreateCollection: () => useMutation({
      ...trpc.videoCollection.create.mutationOptions(),
      onSuccess: () => {
        toast.success('视频集创建成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('创建视频集错误:', error);
        toast.error('视频集创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新视频集
     */
    useUpdateCollection: () => useMutation({
      ...trpc.videoCollection.update.mutationOptions(),
      onSuccess: () => {
        toast.success('视频集更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新视频集错误:', error);
        toast.error('视频集更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除视频集
     */
    useDeleteCollection: () => useMutation({
      ...trpc.videoCollection.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('视频集删除成功', {
          position: 'top-center',
          description: '视频集及所有视频文件已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除视频集错误:', error);
        toast.error('视频集删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 添加视频到视频集
     */
    useAddVideo: () => useMutation({
      ...trpc.videoCollection.addVideo.mutationOptions(),
      onSuccess: () => {
        toast.success('视频上传成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('上传视频错误:', error);
        toast.error('视频上传失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 从视频集删除视频
     */
    useRemoveVideo: () => useMutation({
      ...trpc.videoCollection.removeVideo.mutationOptions(),
      onSuccess: () => {
        toast.success('视频删除成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('删除视频错误:', error);
        toast.error('视频删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新视频信息
     */
    useUpdateVideo: () => useMutation({
      ...trpc.videoCollection.updateVideo.mutationOptions(),
      onSuccess: () => {
        toast.success('视频信息更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新视频错误:', error);
        toast.error('视频信息更新失败', {
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
 * 视频集工具函数
 */
export const videoCollectionUtils = {
  /**
   * 从标题生成 slug
   */
  generateSlugFromTitle: (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  },

  /**
   * 验证 slug 格式
   */
  isValidSlug: (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length <= 100;
  },

  /**
   * 格式化文件大小
   */
  formatSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  },

  /**
   * 格式化时长
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * 格式化分辨率
   */
  formatResolution: (width?: number, height?: number): string | undefined => {
    if (!width || !height) return undefined;
    return `${width}x${height}`;
  },

  /**
   * 验证视频文件
   */
  isValidVideoFile: (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    return validTypes.includes(file.type) || file.name.match(/\.(mp4|webm|ogg|mov|avi|mkv)$/i) !== null;
  },

  /**
   * 验证视频集数据
   */
  validateCollectionData: (data: { title?: string; slug?: string }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('标题不能为空');
    } else if (data.title.length > 200) {
      errors.push('标题不能超过200个字符');
    }

    if (!data.slug?.trim()) {
      errors.push('Slug不能为空');
    } else if (!videoCollectionUtils.isValidSlug(data.slug)) {
      errors.push('Slug格式不正确，只能包含小写字母、数字和连字符');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
