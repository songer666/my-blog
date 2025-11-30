import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/server/init";
import { projectCreateSchema, projectUpdateSchema, projectResponseSchema, projectListResponseSchema } from "@/server/schema/project-schema";
import { getAllProjects, getProjectById, createProject, updateProject, deleteProject, toggleProjectVisibility, checkSlugExists, linkCodeRepository, getAllPublicProjects, getPublicProjectBySlug } from "@/server/actions/project-action";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const projectRoute = createTRPCRouter({
  // 获取所有项目
  getAll: protectedProcedure
    .output(projectListResponseSchema)
    .query(async () => {
      try {
        const projects = await getAllProjects();
        
        return {
          success: true,
          data: projects,
          message: projects.length > 0 ? "获取项目列表成功" : "暂无项目",
        };
      } catch (error: any) {
        console.error("获取项目列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取项目列表失败",
        });
      }
    }),

  // 根据ID获取项目
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(projectResponseSchema)
    .query(async (opts) => {
      try {
        const project = await getProjectById(opts.input.id);
        
        return {
          success: true,
          data: project || undefined,
          message: project ? "获取项目成功" : "项目不存在",
        };
      } catch (error: any) {
        console.error("获取项目失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取项目失败",
        });
      }
    }),

  // 创建项目
  create: protectedProcedure
    .input(projectCreateSchema)
    .output(projectResponseSchema)
    .mutation(async (opts) => {
      try {
        // 检查slug是否已存在
        const slugExists = await checkSlugExists(opts.input.slug);
        if (slugExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "URL别名已存在，请使用其他别名",
          });
        }

        const newProject = await createProject(opts.input);
        
        return {
          success: true,
          data: newProject,
          message: "项目创建成功",
        };
      } catch (error: any) {
        console.error("创建项目失败:", error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建项目失败",
        });
      }
    }),

  // 更新项目
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: projectUpdateSchema,
    }))
    .output(projectResponseSchema)
    .mutation(async (opts) => {
      try {
        // 检查slug是否已存在（排除当前项目）
        const slugExists = await checkSlugExists(opts.input.data.slug, opts.input.id);
        if (slugExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "URL别名已存在，请使用其他别名",
          });
        }

        const updatedProject = await updateProject(opts.input.id, opts.input.data);
        
        return {
          success: true,
          data: updatedProject,
          message: "项目更新成功",
        };
      } catch (error: any) {
        console.error("更新项目失败:", error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || "更新项目失败",
        });
      }
    }),

  // 删除项目
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async (opts) => {
      try {
        await deleteProject(opts.input.id);
        
        return {
          success: true,
          message: "项目删除成功",
        };
      } catch (error: any) {
        console.error("删除项目失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除项目失败",
        });
      }
    }),

  // 切换项目可见性
  toggleVisibility: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(projectResponseSchema)
    .mutation(async (opts) => {
      try {
        const updatedProject = await toggleProjectVisibility(opts.input.id);
        
        return {
          success: true,
          data: updatedProject,
          message: `项目已${updatedProject.visible ? '发布' : '隐藏'}`,
        };
      } catch (error: any) {
        console.error("切换项目可见性失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "切换项目可见性失败",
        });
      }
    }),

  // 检查slug是否存在
  checkSlug: protectedProcedure
    .input(z.object({ 
      slug: z.string(),
      excludeId: z.string().optional(),
    }))
    .output(z.object({
      exists: z.boolean(),
      message: z.string().optional(),
    }))
    .query(async (opts) => {
      try {
        const exists = await checkSlugExists(opts.input.slug, opts.input.excludeId);
        
        return {
          exists,
          message: exists ? "URL别名已存在" : "URL别名可用",
        };
      } catch (error: any) {
        console.error("检查slug失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "检查slug失败",
        });
      }
    }),

  // 关联代码库到项目
  linkCodeRepository: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      codeRepositoryId: z.string().nullable(),
    }))
    .output(projectResponseSchema)
    .mutation(async (opts) => {
      try {
        const updatedProject = await linkCodeRepository(
          opts.input.projectId,
          opts.input.codeRepositoryId
        );
        
        return {
          success: true,
          data: updatedProject,
          message: opts.input.codeRepositoryId ? "代码库关联成功" : "代码库取消关联成功",
        };
      } catch (error: any) {
        console.error("关联代码库失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "关联代码库失败",
        });
      }
    }),

  // 公开API：获取所有项目列表
  getAllPublicProjects: baseProcedure
    .output(z.object({
      success: z.boolean(),
      data: z.array(z.any()).optional(),
      message: z.string().optional(),
    }))
    .query(async () => {
      try {
        const projects = await getAllPublicProjects();
        
        return {
          success: true,
          data: projects,
          message: projects.length > 0 ? "获取项目列表成功" : "暂无项目",
        };
      } catch (error: any) {
        console.error("获取公开项目列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取公开项目列表失败",
        });
      }
    }),

  // 公开API：根据slug获取项目详情
  getPublicProjectBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .output(z.object({
      success: z.boolean(),
      data: z.any().optional(),
      message: z.string().optional(),
    }))
    .query(async (opts) => {
      try {
        const project = await getPublicProjectBySlug(opts.input.slug);
        
        return {
          success: true,
          data: project || undefined,
          message: project ? "获取项目成功" : "项目不存在",
        };
      } catch (error: any) {
        console.error("获取公开项目失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取公开项目失败",
        });
      }
    }),
});

