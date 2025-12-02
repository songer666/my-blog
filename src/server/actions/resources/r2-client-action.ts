"use server";

import { getR2SignedUrl } from "@/lib/r2-utils";

/**
 * Server Action: 获取代码库演示图片上传的预签名 URL
 * 此文件专门用于客户端组件可以调用的 R2 相关 actions
 * 不包含 revalidatePath，避免客户端组件导入错误
 */
export async function getCodeDemoImageUploadUrlAction(data: {
  repositoryId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  try {
    const { repositoryId, fileName, fileType, fileSize } = data;

    // 生成 R2 key - 存储在 code/[repositoryId]/ 目录下
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `code/${repositoryId}/${timestamp}-${sanitizedFileName}`;

    // 获取预签名上传 URL
    const { getR2PresignedPutUrl } = await import('@/lib/r2-utils');
    const uploadUrl = await getR2PresignedPutUrl(r2Key, fileType, 60 * 60); // 1小时有效期

    return {
      success: true,
      data: {
        uploadUrl,
        r2Key,
      },
    };
  } catch (error: any) {
    console.error('获取代码库演示图片上传 URL 失败:', error);
    return { success: false, error: error.message || '获取上传 URL 失败' };
  }
}

/**
 * Server Action: 获取 R2 图片（返回签名 URL）
 */
export async function getR2ImageAction(r2Key: string) {
  try {
    const signedUrl = await getR2SignedUrl(r2Key, 60 * 60 * 3); // 3小时有效期
    return { success: true, url: signedUrl };
  } catch (error: any) {
    console.error('获取 R2 图片失败:', error);
    return { success: false, error: error.message || '获取图片失败' };
  }
}

/**
 * Server Action: 获取图库封面图的公开 URL
 */
export async function getGalleryCoverUrlsAction(galleries: Array<{ id: string; items: Array<{ r2Key: string }> }>) {
  try {
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';
    
    const coverUrls: Record<string, string> = {};
    galleries.forEach((gallery) => {
      if (gallery.items && gallery.items.length > 0) {
        const firstImageKey = gallery.items[0].r2Key;
        coverUrls[gallery.id] = `${R2_PUBLIC_URL}${firstImageKey}`;
      }
    });

    return { success: true, coverUrls };
  } catch (error: any) {
    console.error('获取图库封面 URL 失败:', error);
    return { success: false, error: error.message || '获取封面 URL 失败' };
  }
}
