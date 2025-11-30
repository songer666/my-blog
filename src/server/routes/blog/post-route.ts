import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/server/init";
import { postCreateSchema, postUpdateSchema, postResponseSchema, postListResponseSchema } from "@/server/schema/blog-schema";
import { getAllPosts, getPostById, createPost, updatePost, deletePost, togglePostVisibility, checkSlugExists, getPublicPosts, getPublicPostBySlug } from "@/server/actions/blog/post-action";
import { TRPCError } from "@trpc/server";
import { z } from "zod";


export const postRoute = createTRPCRouter({
  // 获取所有文章
  getAll: protectedProcedure
    .output(postListResponseSchema)
    .query(async () => {
      try {
        const posts = await getAllPosts();
        
        return {
          success: true,
          data: posts,
          message: posts.length > 0 ? "获取文章列表成功" : "暂无文章",
        };
      } catch (error: any) {
        console.error("获取文章列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取文章列表失败",
        });
      }
    }),

  // 根据ID获取文章
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(postResponseSchema.extend({
      data: z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        slug: z.string(),
        content: z.string(),
        image: z.string().nullable(),
        visible: z.boolean(),
        keyWords: z.string().nullable(),
        relatedCodeRepositoryId: z.string().nullable(),
        createdAt: z.date(),
        updatedAt: z.date(),
        tags: z.array(z.object({
          id: z.string(),
          name: z.string(),
          createdAt: z.date(),
          updatedAt: z.date(),
        })).optional(),
        relatedCodeRepository: z.object({
          id: z.string(),
          title: z.string(),
          slug: z.string(),
          description: z.string().nullable(),
        }).optional(),
      }).optional(),
    }))
    .query(async (opts) => {
      try {
        const post = await getPostById(opts.input.id);
        
        return {
          success: true,
          data: post || undefined,
          message: post ? "获取文章成功" : "文章不存在",
        };
      } catch (error: any) {
        console.error("获取文章失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取文章失败",
        });
      }
    }),

  // 创建文章
  create: protectedProcedure
    .input(postCreateSchema)
    .output(postResponseSchema)
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

        const newPost = await createPost(opts.input);
        
        return {
          success: true,
          data: newPost,
          message: "文章创建成功",
        };
      } catch (error: any) {
        console.error("创建文章失败:", error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建文章失败",
        });
      }
    }),

  // 更新文章
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: postUpdateSchema,
    }))
    .output(postResponseSchema)
    .mutation(async (opts) => {
      try {
        // 检查slug是否已存在（排除当前文章）
        const slugExists = await checkSlugExists(opts.input.data.slug, opts.input.id);
        if (slugExists) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "URL别名已存在，请使用其他别名",
          });
        }

        const updatedPost = await updatePost(opts.input.id, opts.input.data);
        
        return {
          success: true,
          data: updatedPost,
          message: "文章更新成功",
        };
      } catch (error: any) {
        console.error("更新文章失败:", error);
        throw new TRPCError({
          code: error.code || 'INTERNAL_SERVER_ERROR',
          message: error.message || "更新文章失败",
        });
      }
    }),

  // 删除文章
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async (opts) => {
      try {
        await deletePost(opts.input.id);
        
        return {
          success: true,
          message: "文章删除成功",
        };
      } catch (error: any) {
        console.error("删除文章失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除文章失败",
        });
      }
    }),

  // 切换文章可见性
  toggleVisibility: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(postResponseSchema)
    .mutation(async (opts) => {
      try {
        const updatedPost = await togglePostVisibility(opts.input.id);
        
        return {
          success: true,
          data: updatedPost,
          message: `文章已${updatedPost.visible ? '发布' : '隐藏'}`,
        };
      } catch (error: any) {
        console.error("切换文章可见性失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "切换文章可见性失败",
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

  // 公开API：获取分页文章列表（支持搜索和标签过滤）
  getPublicPosts: baseProcedure
    .input(z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
      keyword: z.string().optional(),
      tagName: z.string().optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      data: z.object({
        posts: z.array(z.any()),
        total: z.number(),
        page: z.number(),
        limit: z.number(),
        totalPages: z.number(),
      }).optional(),
      message: z.string().optional(),
    }))
    .query(async (opts) => {
      try {
        const result = await getPublicPosts(opts.input);
        
        return {
          success: true,
          data: result,
          message: result.posts.length > 0 ? "获取文章列表成功" : "暂无文章",
        };
      } catch (error: any) {
        console.error("获取公开文章列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取公开文章列表失败",
        });
      }
    }),

  // 公开API：根据slug获取文章详情
  getPublicPostBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .output(z.object({
      success: z.boolean(),
      data: z.any().optional(),
      message: z.string().optional(),
    }))
    .query(async (opts) => {
      try {
        const post = await getPublicPostBySlug(opts.input.slug);
        
        return {
          success: true,
          data: post || undefined,
          message: post ? "获取文章成功" : "文章不存在",
        };
      } catch (error: any) {
        console.error("获取公开文章失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取公开文章失败",
        });
      }
    }),
});
