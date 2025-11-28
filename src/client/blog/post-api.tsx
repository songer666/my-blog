"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PostType, PostCreateType, PostUpdateType, PostWithTagsType } from "@/server/types/blog-type";

/**
 * 博客文章 API 封装
 * 包含所有文章相关的后端调用和用户反馈
 */
export function usePostAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建文章 - 包含完整的错误处理和用户反馈
     */
    useCreatePost: () => useMutation({
      ...trpc.post.create.mutationOptions(),
      onSuccess: (data) => {
        toast.success('文章创建成功', {
          position: 'top-center',
          description: `文章 ${data.data?.title} 已成功创建`
        });
      },
      onError: (error: any) => {
        console.error('创建文章错误:', error);
        toast.error('文章创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新文章 - 包含完整的错误处理和用户反馈
     */
    useUpdatePost: () => useMutation({
      ...trpc.post.update.mutationOptions(),
      onSuccess: (data) => {
        toast.success('文章更新成功', {
          position: 'top-center',
          description: `文章 ${data.data?.title} 已成功更新`
        });
      },
      onError: (error: any) => {
        console.error('更新文章错误:', error);
        toast.error('文章更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除文章 - 包含完整的错误处理和用户反馈
     */
    useDeletePost: () => useMutation({
      ...trpc.post.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('文章删除成功', {
          position: 'top-center',
          description: '文章已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除文章错误:', error);
        toast.error('文章删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 切换文章可见性 - 包含完整的错误处理和用户反馈
     */
    useToggleVisibility: () => useMutation({
      ...trpc.post.toggleVisibility.mutationOptions(),
      onSuccess: (data) => {
        const status = data.data?.visible ? '发布' : '隐藏';
        toast.success(`文章已${status}`, {
          position: 'top-center',
          description: `文章可见性已更新为${status}状态`
        });
      },
      onError: (error: any) => {
        console.error('切换文章可见性错误:', error);
        toast.error('操作失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 获取文章的 query hook
     */
    useGetPostById: () => trpc.post.getById,
    
    /**
     * 检查slug是否存在
     */
    useCheckSlug: () => trpc.post.checkSlug,
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 文章业务逻辑封装
 * 提供高级的文章操作方法
 */
export function usePostOperations() {
  const { useCreatePost, useUpdatePost, useDeletePost, useToggleVisibility } = usePostAPI();
  const createPostMutation = useCreatePost();
  const updatePostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();
  const toggleVisibilityMutation = useToggleVisibility();

  return {
    /**
     * 创建文章的便捷方法
     */
    createPost: async (data: PostCreateType) => {
      return await createPostMutation.mutateAsync(data);
    },

    /**
     * 更新文章的便捷方法
     */
    updatePost: async (id: string, data: PostUpdateType) => {
      return await updatePostMutation.mutateAsync({ id, data });
    },

    /**
     * 删除文章的便捷方法
     */
    deletePost: async (id: string) => {
      return await deletePostMutation.mutateAsync({ id });
    },

    /**
     * 切换文章可见性的便捷方法
     */
    toggleVisibility: async (id: string) => {
      return await toggleVisibilityMutation.mutateAsync({ id });
    },

    /**
     * 获取加载状态
     */
    isLoading: createPostMutation.isPending || updatePostMutation.isPending || 
               deletePostMutation.isPending || toggleVisibilityMutation.isPending,

    /**
     * 重置所有状态
     */
    reset: () => {
      createPostMutation.reset();
      updatePostMutation.reset();
      deletePostMutation.reset();
      toggleVisibilityMutation.reset();
    }
  };
}

/**
 * 文章工具函数
 */
export const postUtils = {
  /**
   * 从标题生成 slug
   */
  generateSlugFromTitle: (title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-') // 替换空格和特殊字符为连字符
      .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
      .substring(0, 100); // 限制长度
  },

  /**
   * 验证 slug 格式
   */
  isValidSlug: (slug: string): boolean => {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug) && slug.length <= 100;
  },

  /**
   * 计算阅读时间（基于字数）
   */
  calculateReadingTime: (content: string): number => {
    const wordsPerMinute = 200; // 平均阅读速度
    const wordCount = content.trim().split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  },

  /**
   * 提取文章摘要
   */
  extractSummary: (content: string, maxLength: number = 150): string => {
    // 移除 markdown 语法
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // 移除标题
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体
      .replace(/`(.*?)`/g, '$1') // 移除行内代码
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
      .trim();

    return plainText.length > maxLength 
      ? plainText.substring(0, maxLength) + '...'
      : plainText;
  },

  /**
   * 验证文章数据完整性
   */
  validatePostData: (data: Partial<PostCreateType>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!data.title?.trim()) {
      errors.push('标题不能为空');
    } else if (data.title.length > 200) {
      errors.push('标题不能超过200个字符');
    }

    if (!data.description?.trim()) {
      errors.push('描述不能为空');
    } else if (data.description.length > 500) {
      errors.push('描述不能超过500个字符');
    }

    if (!data.slug?.trim()) {
      errors.push('URL别名不能为空');
    } else if (!postUtils.isValidSlug(data.slug)) {
      errors.push('URL别名格式不正确，只能包含小写字母、数字和连字符');
    }

    if (!data.content?.trim()) {
      errors.push('内容不能为空');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
