"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * 图库 API 封装
 * 包含所有图库相关的后端调用和用户反馈
 */
export function useImageGalleryAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建图库
     */
    useCreateGallery: () => useMutation({
      ...trpc.imageGallery.create.mutationOptions(),
      onSuccess: () => {
        toast.success('图库创建成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('创建图库错误:', error);
        toast.error('图库创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新图库
     */
    useUpdateGallery: () => useMutation({
      ...trpc.imageGallery.update.mutationOptions(),
      onSuccess: () => {
        toast.success('图库更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新图库错误:', error);
        toast.error('图库更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除图库
     */
    useDeleteGallery: () => useMutation({
      ...trpc.imageGallery.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('图库删除成功', {
          position: 'top-center',
          description: '图库及所有图片已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除图库错误:', error);
        toast.error('图库删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 添加图片到图库
     */
    useAddImage: () => useMutation({
      ...trpc.imageGallery.addImage.mutationOptions(),
      onSuccess: () => {
        toast.success('图片上传成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('上传图片错误:', error);
        toast.error('图片上传失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 从图库删除图片
     */
    useRemoveImage: () => useMutation({
      ...trpc.imageGallery.removeImage.mutationOptions(),
      onSuccess: () => {
        toast.success('图片删除成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('删除图片错误:', error);
        toast.error('图片删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新图片信息
     */
    useUpdateImage: () => useMutation({
      ...trpc.imageGallery.updateImage.mutationOptions(),
      onSuccess: () => {
        toast.success('图片信息更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新图片错误:', error);
        toast.error('图片信息更新失败', {
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
 * 图库工具函数
 */
export const galleryUtils = {
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
   * 验证图片文件
   */
  isValidImageFile: (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  },

  /**
   * 验证图库数据
   */
  validateGalleryData: (data: { title?: string; slug?: string }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('标题不能为空');
    } else if (data.title.length > 200) {
      errors.push('标题不能超过200个字符');
    }

    if (!data.slug?.trim()) {
      errors.push('Slug不能为空');
    } else if (!galleryUtils.isValidSlug(data.slug)) {
      errors.push('Slug格式不正确，只能包含小写字母、数字和连字符');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
