"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * 代码库 API 封装
 */
export function useCodeRepositoryAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建代码库
     */
    useCreateRepository: () => useMutation({
      ...trpc.codeRepository.create.mutationOptions(),
      onSuccess: () => {
        toast.success('代码库创建成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('创建代码库错误:', error);
        toast.error('代码库创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新代码库
     */
    useUpdateRepository: () => useMutation({
      ...trpc.codeRepository.update.mutationOptions(),
      onSuccess: () => {
        toast.success('代码库更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新代码库错误:', error);
        toast.error('代码库更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除代码库
     */
    useDeleteRepository: () => useMutation({
      ...trpc.codeRepository.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('代码库删除成功', {
          position: 'top-center',
          description: '代码库及所有代码文件已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除代码库错误:', error);
        toast.error('代码库删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 添加代码文件
     */
    useAddCode: () => useMutation({
      ...trpc.codeRepository.addCode.mutationOptions(),
      onSuccess: () => {
        toast.success('代码文件上传成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('上传代码错误:', error);
        toast.error('代码文件上传失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除代码文件
     */
    useRemoveCode: () => useMutation({
      ...trpc.codeRepository.removeCode.mutationOptions(),
      onSuccess: () => {
        toast.success('代码文件删除成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('删除代码错误:', error);
        toast.error('代码文件删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新代码文件信息
     */
    useUpdateCode: () => useMutation({
      ...trpc.codeRepository.updateCode.mutationOptions(),
      onSuccess: () => {
        toast.success('代码信息更新成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('更新代码错误:', error);
        toast.error('代码信息更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 添加演示图片
     */
    useAddDemoImage: () => useMutation({
      ...trpc.codeRepository.addDemoImage.mutationOptions(),
      onSuccess: () => {
        toast.success('演示图片上传成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('上传演示图片错误:', error);
        toast.error('演示图片上传失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),

    /**
     * 删除演示图片
     */
    useRemoveDemoImage: () => useMutation({
      ...trpc.codeRepository.removeDemoImage.mutationOptions(),
      onSuccess: () => {
        toast.success('演示图片删除成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('删除演示图片错误:', error);
        toast.error('演示图片删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    getTRPC: () => trpc,
  };
}

/**
 * 代码库工具函数
 */
export const codeRepositoryUtils = {
  generateSlugFromTitle: (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);
  },

  isValidSlug: (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length <= 100;
  },

  formatSize: (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  },

  validateRepositoryData: (data: { title?: string; slug?: string }): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('标题不能为空');
    } else if (data.title.length > 200) {
      errors.push('标题不能超过200个字符');
    }

    if (!data.slug?.trim()) {
      errors.push('Slug不能为空');
    } else if (!codeRepositoryUtils.isValidSlug(data.slug)) {
      errors.push('Slug格式不正确，只能包含小写字母、数字和连字符');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * 根据文件路径构建树形结构
   */
  buildFileTree: (files: Array<{ id: string; path: string; name: string; fileSize: number; language?: string }>) => {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/').filter(Boolean);
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1
            ? { ...file, isFile: true }
            : { children: {}, isFile: false };
        }
        if (!current[part].isFile) {
          current = current[part].children;
        }
      });
    });
    
    return tree;
  },
};
