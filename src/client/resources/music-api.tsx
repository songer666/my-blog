"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * 音乐专辑 API 封装
 * 包含所有音乐专辑相关的后端调用和用户反馈
 */
export function useMusicAlbumAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建专辑
     */
    useCreateAlbum: () => useMutation({
      ...trpc.musicAlbum.create.mutationOptions(),
      onSuccess: () => {
        toast.success('专辑创建成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('创建专辑错误:', error);
        toast.error('专辑创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新专辑
     */
    useUpdateAlbum: () => useMutation({
      ...trpc.musicAlbum.update.mutationOptions(),
      onSuccess: () => {
        toast.success('专辑更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新专辑错误:', error);
        toast.error('专辑更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除专辑
     */
    useDeleteAlbum: () => useMutation({
      ...trpc.musicAlbum.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('专辑删除成功', {
          position: 'top-center',
          description: '专辑及所有音乐文件已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除专辑错误:', error);
        toast.error('专辑删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 添加音乐到专辑
     */
    useAddMusic: () => useMutation({
      ...trpc.musicAlbum.addMusic.mutationOptions(),
      onSuccess: () => {
        toast.success('音乐上传成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('上传音乐错误:', error);
        toast.error('音乐上传失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 从专辑删除音乐
     */
    useRemoveMusic: () => useMutation({
      ...trpc.musicAlbum.removeMusic.mutationOptions(),
      onSuccess: () => {
        toast.success('音乐删除成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('删除音乐错误:', error);
        toast.error('音乐删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新音乐信息
     */
    useUpdateMusic: () => useMutation({
      ...trpc.musicAlbum.updateMusic.mutationOptions(),
      onSuccess: () => {
        toast.success('音乐信息更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新音乐错误:', error);
        toast.error('音乐信息更新失败', {
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
 * 音乐专辑工具函数
 */
export const musicAlbumUtils = {
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
   * 格式化比特率
   */
  formatBitrate: (bitrate?: number): string | undefined => {
    if (!bitrate) return undefined;
    return `${Math.round(bitrate / 1000)} kbps`;
  },

  /**
   * 验证音频文件
   */
  isValidAudioFile: (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac'];
    return validTypes.includes(file.type) || file.name.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i) !== null;
  },

  /**
   * 验证专辑数据
   */
  validateAlbumData: (data: { title?: string; slug?: string }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('标题不能为空');
    } else if (data.title.length > 200) {
      errors.push('标题不能超过200个字符');
    }

    if (!data.slug?.trim()) {
      errors.push('Slug不能为空');
    } else if (!musicAlbumUtils.isValidSlug(data.slug)) {
      errors.push('Slug格式不正确，只能包含小写字母、数字和连字符');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
