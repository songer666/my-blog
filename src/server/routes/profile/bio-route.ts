import {baseProcedure, createTRPCRouter, protectedProcedure} from "@/server/init";
import { bioUpdateSchema, profileResponseSchema, bioResponseSchema } from "@/server/schema/profile-schema";
import { getProfile, updateBio, getFullProfile, getPublicFullProfile } from "@/server/actions/profile/bio-action";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";

const adminUrl = '/admin/dashboard/profile';
const aboutUrl = '/root/about';

export const bioRoute = createTRPCRouter({
  // 获取个人基本信息
  get: baseProcedure
    .output(profileResponseSchema)
    .query(async () => {
      try {
        const profile = await getProfile();
        
        return {
          success: true,
          data: profile || undefined,
          message: profile ? "获取个人资料成功" : "暂无个人资料",
        };
      } catch (error: any) {
        console.error("获取个人资料失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取个人资料失败",
        });
      }
    }),

  // 获取完整个人资料
  getFull: protectedProcedure
    .query(async () => {
      try {
        const profile = await getFullProfile();
        
        return {
          success: true,
          data: profile || undefined,
          message: profile ? "获取完整个人资料成功" : "暂无个人资料",
        };
      } catch (error: any) {
        console.error("获取完整个人资料失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取完整个人资料失败",
        });
      }
    }),

  // 获取公开的完整个人资料（包含友链）
  getPublicFull: baseProcedure
    .query(async () => {
      try {
        const profile = await getPublicFullProfile();
        
        return {
          success: true,
          data: profile || undefined,
          message: profile ? "获取公开个人资料成功" : "暂无个人资料",
        };
      } catch (error: any) {
        console.error("获取公开个人资料失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取公开个人资料失败",
        });
      }
    }),

  // 更新个人基本信息
  update: protectedProcedure
    .input(bioUpdateSchema)
    .output(bioResponseSchema)
    .mutation(async (opts) => {
      try {
        const updatedProfile = await updateBio(opts.input);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: true,
          data: updatedProfile,
          message: "个人资料更新成功",
        };
      } catch (error: any) {
        console.error("更新个人资料失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "更新个人资料失败",
        });
      }
    }),
});
