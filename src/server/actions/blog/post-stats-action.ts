import { db } from "@/db";
import { postView, post } from "@/db/schema/blog";
import { eq, count, and } from "drizzle-orm";
import { PostStatsType, PostViewType } from "@/server/types/blog-type";
import { postStatsConfig } from "@/lib/post-stats-config";

/**
 * 检查统计功能是否启用
 */
function checkStatsEnabled(): boolean {
  if (!postStatsConfig.enabled) {
    return false;
  }
  
  // 检查是否在开发环境且禁用了开发环境统计
  if (process.env.NODE_ENV === 'development' && !postStatsConfig.enableInDev) {
    return false;
  }
  
  return true;
}

/**
 * 记录文章访问
 * 使用 upsert 逻辑：如果 IP 已存在则更新时间，否则插入新记录
 */
export async function recordPostView(
  postId: string,
  ip: string,
  userAgent?: string
): Promise<{ success: boolean; isNewView: boolean }> {
  // 如果统计功能禁用，直接返回
  if (!checkStatsEnabled()) {
    return { success: true, isNewView: false };
  }

  try {
    // 检查是否已存在该 IP 的访问记录
    const existingView = await db.query.postView.findFirst({
      where: and(eq(postView.postId, postId), eq(postView.ip, ip)),
    });

    if (existingView) {
      // IP 已存在，不重复计数
      return { success: true, isNewView: false };
    }

    // 插入新访问记录
    await db.insert(postView).values({
      postId,
      ip,
      userAgent: userAgent || null,
    });

    return { success: true, isNewView: true };
  } catch (error: any) {
    // 处理唯一约束冲突（并发情况）
    if (error.code === '23505') {
      return { success: true, isNewView: false };
    }
    console.error("记录文章访问失败:", error);
    throw new Error("记录文章访问失败");
  }
}

/**
 * 获取文章访问统计
 * @param skipConfigCheck 跳过配置检查（管理端使用）
 */
export async function getPostStats(postId: string, skipConfigCheck = false): Promise<PostStatsType> {
  // 如果统计功能禁用且不跳过检查，返回 0
  if (!skipConfigCheck && !checkStatsEnabled()) {
    return { postId, viewCount: 0 };
  }

  try {
    const result = await db
      .select({ count: count() })
      .from(postView)
      .where(eq(postView.postId, postId));

    return {
      postId,
      viewCount: result[0]?.count || 0,
    };
  } catch (error) {
    console.error("获取文章访问统计失败:", error);
    return { postId, viewCount: 0 };
  }
}

/**
 * 批量获取文章访问统计
 */
export async function getPostStatsBatch(postIds: string[]): Promise<PostStatsType[]> {
  // 如果统计功能禁用，返回空统计
  if (!checkStatsEnabled()) {
    return postIds.map(postId => ({ postId, viewCount: 0 }));
  }

  try {
    const results = await Promise.all(
      postIds.map(async (postId) => {
        const result = await db
          .select({ count: count() })
          .from(postView)
          .where(eq(postView.postId, postId));
        return {
          postId,
          viewCount: result[0]?.count || 0,
        };
      })
    );

    return results;
  } catch (error) {
    console.error("批量获取文章访问统计失败:", error);
    return postIds.map(postId => ({ postId, viewCount: 0 }));
  }
}

/**
 * 获取文章的访问记录列表（管理端用）
 * @param skipConfigCheck 跳过配置检查（管理端使用）
 */
export async function getPostViewList(postId: string, skipConfigCheck = false): Promise<PostViewType[]> {
  // 如果统计功能禁用且不跳过检查，返回空数组
  if (!skipConfigCheck && !checkStatsEnabled()) {
    return [];
  }

  try {
    const views = await db.query.postView.findMany({
      where: eq(postView.postId, postId),
      orderBy: (postView, { desc }) => [desc(postView.createdAt)],
    });

    return views;
  } catch (error) {
    console.error("获取文章访问记录失败:", error);
    return [];
  }
}

/**
 * 删除文章的所有访问记录
 */
export async function deletePostViews(postId: string): Promise<void> {
  if (!checkStatsEnabled()) {
    return;
  }

  try {
    await db.delete(postView).where(eq(postView.postId, postId));
  } catch (error) {
    console.error("删除文章访问记录失败:", error);
    throw new Error("删除文章访问记录失败");
  }
}
