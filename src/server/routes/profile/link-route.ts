import { createTRPCRouter, protectedProcedure } from "@/server/init";
import { socialLinkUpdateSchema, socialLinkListResponseSchema, socialLinkResponseSchema } from "@/server/schema/profile-schema";
import { getSocialLinkList, createSocialLink, updateSocialLink, deleteSocialLink, getSocialLinkById } from "@/server/actions/profile/link-action";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const adminUrl = '/admin/dashboard/profile';
const aboutUrl = '/root/about';

export const linkRoute = createTRPCRouter({
  // 获取社交链接列表
  list: protectedProcedure
    .output(socialLinkListResponseSchema)
    .query(async () => {
      try {
        const socialLinkList = await getSocialLinkList();
        
        return {
          success: true,
          data: socialLinkList,
          message: socialLinkList.length > 0 ? "获取社交链接成功" : "暂无社交链接",
        };
      } catch (error: any) {
        console.error("获取社交链接失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取社交链接失败",
        });
      }
    }),

  // 根据ID获取单个社交链接
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(socialLinkResponseSchema)
    .query(async (opts) => {
      try {
        const socialLinkData = await getSocialLinkById(opts.input.id);
        
        return {
          success: true,
          data: socialLinkData || undefined,
          message: socialLinkData ? "获取社交链接成功" : "社交链接不存在",
        };
      } catch (error: any) {
        console.error("获取社交链接失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取社交链接失败",
        });
      }
    }),

  // 新增社交链接
  create: protectedProcedure
    .input(socialLinkUpdateSchema)
    .output(socialLinkResponseSchema)
    .mutation(async (opts) => {
      try {
        const newSocialLink = await createSocialLink(opts.input);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: true,
          data: newSocialLink,
          message: "社交链接添加成功",
        };
      } catch (error: any) {
        console.error("创建社交链接失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建社交链接失败",
        });
      }
    }),

  // 更新社交链接
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: socialLinkUpdateSchema,
    }))
    .output(socialLinkResponseSchema)
    .mutation(async (opts) => {
      try {
        const updatedSocialLink = await updateSocialLink(opts.input.id, opts.input.data);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: true,
          data: updatedSocialLink,
          message: "社交链接更新成功",
        };
      } catch (error: any) {
        console.error("更新社交链接失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "更新社交链接失败",
        });
      }
    }),

  // 删除社交链接
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteSocialLink(opts.input.id);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: result.deleted,
          message: result.deleted ? "社交链接删除成功" : "删除失败",
        };
      } catch (error: any) {
        console.error("删除社交链接失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除社交链接失败",
        });
      }
    }),
});
