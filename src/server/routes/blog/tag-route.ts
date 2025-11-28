import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/server/init";
import { tagUpdateSchema, tagResponseSchema, tagListResponseSchema } from "@/server/schema/blog-schema";
import { getAllTags, getTagById, createTag, updateTag, deleteTag, getPublicTagsWithCount } from "@/server/actions/blog/tag-action";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const isrUrl = '/admin/dashboard/blog/tag';
const rootUrl = '/root/blog'

export const tagRoute = createTRPCRouter({
  // 获取所有标签
  getAll: protectedProcedure
    .output(tagListResponseSchema)
    .query(async () => {
      try {
        const tags = await getAllTags();
        
        return {
          success: true,
          data: tags,
          message: tags.length > 0 ? "获取标签列表成功" : "暂无标签",
        };
      } catch (error: any) {
        console.error("获取标签列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取标签列表失败",
        });
      }
    }),

  // 根据ID获取标签
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(tagResponseSchema)
    .query(async (opts) => {
      try {
        const tag = await getTagById(opts.input.id);
        
        return {
          success: true,
          data: tag || undefined,
          message: tag ? "获取标签成功" : "标签不存在",
        };
      } catch (error: any) {
        console.error("获取标签失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取标签失败",
        });
      }
    }),

  // 创建标签
  create: protectedProcedure
    .input(tagUpdateSchema)
    .output(tagResponseSchema)
    .mutation(async (opts) => {
      try {
        const newTag = await createTag(opts.input);
        
        // 重新验证页面缓存
        revalidatePath(isrUrl);
        revalidatePath(rootUrl);

        return {
          success: true,
          data: newTag,
          message: "标签创建成功",
        };
      } catch (error: any) {
        console.error("创建标签失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建标签失败",
        });
      }
    }),

  // 更新标签
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: tagUpdateSchema,
    }))
    .output(tagResponseSchema)
    .mutation(async (opts) => {
      try {
        const updatedTag = await updateTag(opts.input.id, opts.input.data);
        
        // 重新验证页面缓存
        revalidatePath(isrUrl);
        revalidatePath(rootUrl);

        return {
          success: true,
          data: updatedTag,
          message: "标签更新成功",
        };
      } catch (error: any) {
        console.error("更新标签失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "更新标签失败",
        });
      }
    }),

  // 删除标签
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(z.object({
      success: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async (opts) => {
      try {
        await deleteTag(opts.input.id);
        
        // 重新验证页面缓存
        revalidatePath(isrUrl);
        revalidatePath(rootUrl);

        return {
          success: true,
          message: "标签删除成功",
        };
      } catch (error: any) {
        console.error("删除标签失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除标签失败",
        });
      }
    }),

  // 公开API：获取所有标签及文章数量
  getPublicTagsWithCount: baseProcedure
    .output(z.object({
      success: z.boolean(),
      data: z.array(z.any()).optional(),
      message: z.string().optional(),
    }))
    .query(async () => {
      try {
        const tags = await getPublicTagsWithCount();
        return {
          success: true,
          data: tags,
          message: tags.length > 0 ? "获取标签列表成功" : "暂无标签",
        };
      } catch (error: any) {
        console.error("获取公开标签失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取公开标签失败",
        });
      }
    }),
});
