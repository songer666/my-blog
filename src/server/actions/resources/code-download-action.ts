"use server";

import { db } from "@/db";
import { codeRepository } from '@/db/schema/resources';
import { eq } from "drizzle-orm";
import JSZip from "jszip";

/**
 * Server Action: 下载代码库为 ZIP
 * 这个文件单独存放，避免客户端组件导入时引入 revalidatePath
 */
export async function downloadRepositoryZipAction(repositoryId: string) {
  try {
    // 获取代码库数据
    const repository = await db.query.codeRepository.findFirst({
      where: eq(codeRepository.id, repositoryId),
    });

    if (!repository) {
      throw new Error("代码库不存在");
    }

    const items = repository.items || [];

    if (items.length === 0) {
      throw new Error("代码库中没有文件");
    }

    // 创建 ZIP
    const zip = new JSZip();

    // 添加所有文件到 ZIP
    items.forEach((item: any) => {
      if (item.content) {
        zip.file(item.path, item.content);
      }
    });

    // 生成 ZIP buffer
    const zipBuffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    // 返回 base64 编码的 ZIP（用于下载）
    return {
      success: true,
      data: zipBuffer.toString('base64'),
      filename: `${repository.slug || repository.title}.zip`,
    };
  } catch (error: any) {
    console.error("下载 ZIP 错误:", error);
    return {
      success: false,
      error: error.message || "下载失败",
    };
  }
}
