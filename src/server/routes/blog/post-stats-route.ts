import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/server/init";
import { 
  postStatsResponseSchema, 
  postStatsBatchResponseSchema 
} from "@/server/schema/blog-schema";
import { 
  recordPostView, 
  getPostStats, 
  getPostStatsBatch,
  getPostViewList 
} from "@/server/actions/blog/post-stats-action";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { postStatsConfig } from "@/lib/post-stats-config";
import { headers } from "next/headers";
import { formatIpAddress } from "@/lib/ip-utils";

/**
 * 检查统计功能是否启用
 */
function isStatsEnabled(): boolean {
  if (!postStatsConfig.enabled) {
    return false;
  }
  
  if (process.env.NODE_ENV === 'development' && !postStatsConfig.enableInDev) {
    return false;
  }
  
  return true;
}

export const postStatsRoute = createTRPCRouter({
  /**
   * 记录文章访问（公开 API）
   * IP 从请求头自动获取
   */
  recordView: baseProcedure
    .input(z.object({
      postId: z.string().min(1, "文章ID不能为空"),
      userAgent: z.string().optional(),
    }))
    .output(z.object({
      success: z.boolean(),
      isNewView: z.boolean(),
      message: z.string().optional(),
    }))
    .mutation(async (opts) => {
      // 如果统计功能禁用，直接返回成功但不执行任何操作
      if (!isStatsEnabled()) {
        return {
          success: true,
          isNewView: false,
          message: "统计功能已禁用",
        };
      }

      try {
        // 从请求头获取 IP 地址
        const headersList = await headers();
        const rawIpAddress = 
          headersList.get('x-forwarded-for')?.split(',')[0] || 
          headersList.get('x-real-ip') || 
          headersList.get('cf-connecting-ip') || 
          'unknown';
        
        // 格式化 IP 地址（处理 IPv6）
        const ip = formatIpAddress(rawIpAddress);

        const result = await recordPostView(
          opts.input.postId,
          ip,
          opts.input.userAgent
        );

        return {
          success: result.success,
          isNewView: result.isNewView,
          message: result.isNewView ? "访问已记录" : "访问已存在",
        };
      } catch (error: any) {
        console.error("记录访问失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "记录访问失败",
        });
      }
    }),

  /**
   * 获取单篇文章统计（公开 API）
   */
  getStats: baseProcedure
    .input(z.object({ postId: z.string() }))
    .output(postStatsResponseSchema)
    .query(async (opts) => {
      // 如果统计功能禁用，返回 0
      if (!isStatsEnabled()) {
        return {
          success: true,
          data: { postId: opts.input.postId, viewCount: 0 },
          message: "统计功能已禁用",
        };
      }

      try {
        const stats = await getPostStats(opts.input.postId);

        return {
          success: true,
          data: stats,
          message: "获取统计成功",
        };
      } catch (error: any) {
        console.error("获取统计失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取统计失败",
        });
      }
    }),

  /**
   * 批量获取文章统计（公开 API）
   */
  getStatsBatch: baseProcedure
    .input(z.object({ postIds: z.array(z.string()) }))
    .output(postStatsBatchResponseSchema)
    .query(async (opts) => {
      // 如果统计功能禁用，返回空统计
      if (!isStatsEnabled()) {
        return {
          success: true,
          data: opts.input.postIds.map(postId => ({ postId, viewCount: 0 })),
          message: "统计功能已禁用",
        };
      }

      try {
        const stats = await getPostStatsBatch(opts.input.postIds);

        return {
          success: true,
          data: stats,
          message: "获取统计成功",
        };
      } catch (error: any) {
        console.error("批量获取统计失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "批量获取统计失败",
        });
      }
    }),

  /**
   * 获取文章访问记录列表（管理端 API）
   * 管理端不检查配置，始终可以查看
   */
  getViewList: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .output(z.object({
      success: z.boolean(),
      data: z.array(z.object({
        id: z.string(),
        postId: z.string(),
        ip: z.string(),
        userAgent: z.string().nullable(),
        createdAt: z.date(),
      })).optional(),
      message: z.string().optional(),
    }))
    .query(async (opts) => {
      try {
        // 管理端跳过配置检查
        const views = await getPostViewList(opts.input.postId, true);

        return {
          success: true,
          data: views,
          message: "获取访问记录成功",
        };
      } catch (error: any) {
        console.error("获取访问记录失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取访问记录失败",
        });
      }
    }),

  /**
   * 获取单篇文章统计（管理端 API）
   * 管理端不检查配置，始终可以查看
   */
  adminGetStats: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .output(postStatsResponseSchema)
    .query(async (opts) => {
      try {
        // 管理端跳过配置检查
        const stats = await getPostStats(opts.input.postId, true);

        return {
          success: true,
          data: stats,
          message: "获取统计成功",
        };
      } catch (error: any) {
        console.error("获取统计失败:", error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || "获取统计失败",
        });
      }
    }),

  /**
   * 获取统计功能配置状态（公开 API）
   */
  getConfig: baseProcedure
    .output(z.object({
      enabled: z.boolean(),
      showViewCount: z.boolean(),
    }))
    .query(() => {
      return {
        enabled: isStatsEnabled(),
        showViewCount: postStatsConfig.showViewCount,
      };
    }),
});
