import { createTRPCRouter, protectedProcedure } from "@/server/init";
import { friendUpdateSchema, friendListResponseSchema, friendResponseSchema } from "@/server/schema/profile-schema";
import { getFriendList, createFriend, deleteFriend, getFriendById } from "@/server/actions/profile/friend-action";
import { TRPCError } from "@trpc/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const adminUrl = '/admin/dashboard/profile';
const aboutUrl = '/root/about';

export const friendRoute = createTRPCRouter({
  // 获取友链列表
  list: protectedProcedure
    .output(friendListResponseSchema)
    .query(async () => {
      try {
        const friendList = await getFriendList();
        
        return {
          success: true,
          data: friendList,
          message: friendList.length > 0 ? "获取友链列表成功" : "暂无友链",
        };
      } catch (error: any) {
        console.error("获取友链列表失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取友链列表失败",
        });
      }
    }),

  // 根据ID获取单个友链
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .output(friendResponseSchema)
    .query(async (opts) => {
      try {
        const friendData = await getFriendById(opts.input.id);
        
        return {
          success: true,
          data: friendData || undefined,
          message: friendData ? "获取友链成功" : "友链不存在",
        };
      } catch (error: any) {
        console.error("获取友链失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取友链失败",
        });
      }
    }),

  // 新增友链
  create: protectedProcedure
    .input(friendUpdateSchema)
    .output(friendResponseSchema)
    .mutation(async (opts) => {
      try {
        const newFriend = await createFriend(opts.input);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: true,
          data: newFriend,
          message: "友链添加成功",
        };
      } catch (error: any) {
        console.error("创建友链失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "创建友链失败",
        });
      }
    }),

  // 删除友链
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const result = await deleteFriend(opts.input.id);
        
        // 重新验证页面缓存
        revalidatePath(adminUrl);
        revalidatePath(aboutUrl);
        
        return {
          success: result.deleted,
          message: result.deleted ? "友链删除成功" : "删除失败",
        };
      } catch (error: any) {
        console.error("删除友链失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "删除友链失败",
        });
      }
    }),
});
