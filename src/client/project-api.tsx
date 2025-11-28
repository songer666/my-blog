"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProjectType, ProjectCreateType, ProjectUpdateType } from "@/server/types/project-type";

/**
 * 项目 API 封装
 * 包含所有项目相关的后端调用和用户反馈
 */
export function useProjectAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建项目 - 包含完整的错误处理和用户反馈
     */
    useCreateProject: () => useMutation({
      ...trpc.project.create.mutationOptions(),
      onSuccess: (data) => {
        toast.success('项目创建成功', {
          position: 'top-center',
          description: `项目 ${data.data?.title} 已成功创建`
        });
      },
      onError: (error: any) => {
        console.error('创建项目错误:', error);
        toast.error('项目创建失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 更新项目 - 包含完整的错误处理和用户反馈
     */
    useUpdateProject: () => useMutation({
      ...trpc.project.update.mutationOptions(),
      onSuccess: (data) => {
        toast.success('项目更新成功', {
          position: 'top-center',
          description: `项目 ${data.data?.title} 已成功更新`
        });
      },
      onError: (error: any) => {
        console.error('更新项目错误:', error);
        toast.error('项目更新失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除项目 - 包含完整的错误处理和用户反馈
     */
    useDeleteProject: () => useMutation({
      ...trpc.project.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('项目删除成功', {
          position: 'top-center',
          description: '项目已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除项目错误:', error);
        toast.error('项目删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 切换项目可见性 - 包含完整的错误处理和用户反馈
     */
    useToggleVisibility: () => useMutation({
      ...trpc.project.toggleVisibility.mutationOptions(),
      onSuccess: (data) => {
        const status = data.data?.visible ? '发布' : '隐藏';
        toast.success(`项目已${status}`, {
          position: 'top-center',
          description: `项目可见性已更新为${status}状态`
        });
      },
      onError: (error: any) => {
        console.error('切换项目可见性错误:', error);
        toast.error('操作失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 获取项目的 query hook
     */
    useGetProjectById: () => trpc.project.getById,
    
    /**
     * 检查slug是否存在
     */
    useCheckSlug: () => trpc.project.checkSlug,
    
    /**
     * 关联代码库到项目
     */
    useLinkCodeRepository: () => useMutation({
      ...trpc.project.linkCodeRepository.mutationOptions(),
      onSuccess: (data) => {
        toast.success(data.message || '关联成功', {
          position: 'top-center',
        });
      },
      onError: (error: any) => {
        console.error('关联代码库失败:', error);
        toast.error('关联失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),

    /**
     * 获取所有代码库列表（用于选择关联）
     */
    useGetAllCodeRepositories: () => trpc.codeRepository.all,
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 项目业务逻辑封装
 * 提供高级的项目操作方法
 */
export function useProjectOperations() {
  const { useCreateProject, useUpdateProject, useDeleteProject, useToggleVisibility } = useProjectAPI();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const toggleVisibilityMutation = useToggleVisibility();

  return {
    /**
     * 创建项目的便捷方法
     */
    createProject: async (data: ProjectCreateType) => {
      return await createProjectMutation.mutateAsync(data);
    },

    /**
     * 更新项目的便捷方法
     */
    updateProject: async (id: string, data: ProjectUpdateType) => {
      return await updateProjectMutation.mutateAsync({ id, data });
    },

    /**
     * 删除项目的便捷方法
     */
    deleteProject: async (id: string) => {
      return await deleteProjectMutation.mutateAsync({ id });
    },

    /**
     * 切换项目可见性的便捷方法
     */
    toggleVisibility: async (id: string) => {
      return await toggleVisibilityMutation.mutateAsync({ id });
    },

    /**
     * 获取加载状态
     */
    isLoading: createProjectMutation.isPending || updateProjectMutation.isPending || 
               deleteProjectMutation.isPending || toggleVisibilityMutation.isPending,

    /**
     * 重置所有状态
     */
    reset: () => {
      createProjectMutation.reset();
      updateProjectMutation.reset();
      deleteProjectMutation.reset();
      toggleVisibilityMutation.reset();
    }
  };
}

/**
 * 项目工具函数
 */
export const projectUtils = {
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
   * 验证项目数据完整性
   */
  validateProjectData: (data: Partial<ProjectCreateType>): { valid: boolean; errors: string[] } => {
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
    } else if (!projectUtils.isValidSlug(data.slug)) {
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

