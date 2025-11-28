import { useMutation } from "@tanstack/react-query";
import {useTRPC} from "@/components/trpc/client";

/**
 * TRPC Hook 工具函数
 * 用于在 React 组件中获取技能相关的 mutations
 */
export function useSkillAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 新增技能分类的 mutation hook
     */
    useCreateSkillCategory: () => useMutation(trpc.skill.createCategory.mutationOptions()),
    
    /**
     * 删除技能分类的 mutation hook
     */
    useDeleteSkillCategory: () => useMutation(trpc.skill.deleteCategory.mutationOptions()),
    
    /**
     * 新增技能的 mutation hook
     */
    useCreateSkill: () => useMutation(trpc.skill.createSkill.mutationOptions()),
    
    /**
     * 删除技能的 mutation hook
     */
    useDeleteSkill: () => useMutation(trpc.skill.deleteSkill.mutationOptions()),
    
    /**
     * 获取技能分类的 query hook
     */
    useGetSkillCategoryById: () => trpc.skill.getCategoryById,
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}


/**
 * 验证技能名称
 */
export function validateSkillName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      message: '技能名称不能为空',
    };
  }

  if (name.length > 50) {
    return {
      valid: false,
      message: '技能名称不能超过50个字符',
    };
  }

  return { valid: true };
}

/**
 * 验证分类名称
 */
export function validateCategoryName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      message: '分类名称不能为空',
    };
  }

  if (name.length > 50) {
    return {
      valid: false,
      message: '分类名称不能超过50个字符',
    };
  }

  return { valid: true };
}

/**
 * 验证技能图标文件类型和大小
 */
export function validateSkillIconFile(file: File): { valid: boolean; message?: string } {
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      message: '只支持 JPEG、PNG、WebP、SVG 格式的图片',
    };
  }

  // 检查文件大小 (512KB，图标应该很小)
  const maxSize = 512 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      message: '图标文件大小不能超过 512KB',
    };
  }

  return { valid: true };
}

/**
 * 生成技能的显示样式类
 */
export function getSkillDisplayClass(skillName: string): string {
  // 根据技能名称返回不同的样式类
  const techSkills = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'Java'];
  const designSkills = ['UI/UX设计', 'Figma', 'Photoshop'];
  const toolSkills = ['Git', 'Docker', 'VS Code'];
  
  if (techSkills.some(tech => skillName.includes(tech))) {
    return 'skill-tech';
  } else if (designSkills.some(design => skillName.includes(design))) {
    return 'skill-design';
  } else if (toolSkills.some(tool => skillName.includes(tool))) {
    return 'skill-tool';
  }
  
  return 'skill-default';
}
