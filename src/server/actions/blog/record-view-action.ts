"use server";

import { headers } from "next/headers";
import { formatIpAddress } from "@/lib/ip-utils";
import { recordPostView, getPostStats } from "./post-stats-action";
import { postStatsConfig } from "@/lib/post-stats-config";

/**
 * Server Action: 记录文章访问
 * 可以直接在客户端组件中调用
 */
export async function recordViewAction(postId: string, userAgent?: string) {
  // 检查配置
  if (!postStatsConfig.enabled) {
    return { success: true, isNewView: false };
  }

  if (process.env.NODE_ENV === 'development' && !postStatsConfig.enableInDev) {
    return { success: true, isNewView: false };
  }

  try {
    // 从请求头获取 IP 地址
    const headersList = await headers();
    const rawIpAddress = 
      headersList.get('x-forwarded-for')?.split(',')[0] || 
      headersList.get('x-real-ip') || 
      headersList.get('cf-connecting-ip') || 
      'unknown';
    
    // 格式化 IP 地址
    const ip = formatIpAddress(rawIpAddress);

    // 记录访问
    const result = await recordPostView(postId, ip, userAgent);

    return result;
  } catch (error) {
    console.error("记录访问失败:", error);
    return { success: false, isNewView: false };
  }
}

/**
 * Server Action: 获取文章统计
 * 可以直接在客户端组件中调用
 */
export async function getPostStatsAction(postId: string) {
  // 检查配置
  if (!postStatsConfig.enabled) {
    return { postId, viewCount: 0 };
  }

  if (process.env.NODE_ENV === 'development' && !postStatsConfig.enableInDev) {
    return { postId, viewCount: 0 };
  }

  try {
    const stats = await getPostStats(postId);
    return stats;
  } catch (error) {
    console.error("获取统计失败:", error);
    return { postId, viewCount: 0 };
  }
}
