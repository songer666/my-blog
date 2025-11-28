import { createTRPCRouter, protectedProcedure } from "@/server/init";
import { 
  skillCategoryUpdateSchema, 
  skillCategoryListResponseSchema,
  skillCategoryResponseSchema,
  skillUpdateSchema,
  skillResponseSchema,
} from "@/server/schema/profile-schema";
import { 
  getSkillCategoriesWithSkills, 
  createSkillCategory, 
  deleteSkillCategory,
  createSkill,
  deleteSkill,
  getSkillCategoryById,
  getSkillsByCategoryId,
} from "@/server/actions/profile/skill-action";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const adminUrl = '/admin/dashboard/profile';
const aboutUrl = '/root/about';

export const skillRoute = createTRPCRouter({
  // 获取技能分类列表（包含技能）
  list: protectedProcedure
    .output(skillCategoryListResponseSchema)
    .query(async () => {
      try {
        const skillCategories = await getSkillCategoriesWithSkills();
        
        return {
          success: true,
          data: skillCategories,
          message: skillCategories.length > 0 ? "获取技能分类成功" : "暂无技能分类",
        };
      } catch (error: any) {
        console.error("获取技能分类失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取技能分类失败",
        });
      }
    }),

  // 根据ID获取技能分类
  getCategoryById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(skillCategoryResponseSchema)
    .query(async (opts) => {
      try {
        const category = await getSkillCategoryById(opts.input.id);
        
        return {
          success: true,
          data: category || undefined,
          message: category ? "获取技能分类成功" : "技能分类不存在",
        };
      } catch (error: any) {
        console.error("获取技能分类失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取技能分类失败",
        });
      }
    }),

  // 根据分类ID获取技能列表
  getSkillsByCategory: protectedProcedure
    .input(z.object({ categoryId: z.string() }))
    .query(async (opts) => {
      try {
        const skills = await getSkillsByCategoryId(opts.input.categoryId);
        
        return {
          success: true,
          data: skills,
          message: skills.length > 0 ? "获取技能列表成功" : "该分类下暂无技能",
        };
      } catch (error: any) {
        console.error("获取技能列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取技能列表失败",
        });
      }
    }),

  // 新增技能分类
  createCategory: protectedProcedure
    .input(skillCategoryUpdateSchema)
    .output(skillCategoryResponseSchema)
    .mutation(async (opts) => {
      try {
        const newCategory = await createSkillCategory(opts.input);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: true,
          data: newCategory,
          message: "技能分类添加成功",
        };
      } catch (error: any) {
        console.error("创建技能分类失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建技能分类失败",
        });
      }
    }),

  // 删除技能分类
  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteSkillCategory(opts.input.id);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: result.deleted,
          message: result.deleted ? "技能分类删除成功" : "删除失败",
        };
      } catch (error: any) {
        console.error("删除技能分类失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除技能分类失败",
        });
      }
    }),

  // 新增技能
  createSkill: protectedProcedure
    .input(skillUpdateSchema)
    .output(skillResponseSchema)
    .mutation(async (opts) => {
      try {
        const newSkill = await createSkill(opts.input);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: true,
          data: newSkill,
          message: "技能添加成功",
        };
      } catch (error: any) {
        console.error("创建技能失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建技能失败",
        });
      }
    }),

  // 删除技能
  deleteSkill: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteSkill(opts.input.id);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: result.deleted,
          message: result.deleted ? "技能删除成功" : "删除失败",
        };
      } catch (error: any) {
        console.error("删除技能失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除技能失败",
        });
      }
    }),
});
