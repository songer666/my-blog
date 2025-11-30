"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function revalidatePathAction(path: string) {
  try {
    // 验证用户是否已登录
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return {
        success: false,
        error: "未授权",
      };
    }

    if (!path || typeof path !== "string") {
      return {
        success: false,
        error: "无效的路径参数",
      };
    }

    // 执行 revalidate
    revalidatePath(path);

    return {
      success: true,
      message: "缓存刷新成功",
      path,
    };
  } catch (error) {
    console.error("Revalidate error:", error);
    return {
      success: false,
      error: "刷新缓存失败",
    };
  }
}
