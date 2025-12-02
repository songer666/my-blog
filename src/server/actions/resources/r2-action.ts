"use server";

import { getR2SignedUrl, uploadToR2, R2_SIGNED_URL_EXPIRES } from "@/lib/r2-utils";
import { caller } from "@/components/trpc/server";
import { revalidatePath } from "next/cache";
import JSZip from "jszip";
// import { createExtractorFromData } from "node-unrar-js"; // 暂时禁用，WASM 在 Next.js 中有兼容性问题

/**
 * Server Action: 获取 R2 签名 URL
 */
export async function getSignedUrlAction(r2Key: string) {
  try {
    const signedUrl = await getR2SignedUrl(r2Key, R2_SIGNED_URL_EXPIRES);
    return { success: true, signedUrl };
  } catch (error: any) {
    console.error('获取签名 URL 失败:', error);
    return { success: false, error: error.message || '获取签名失败' };
  }
}

/**
 * Server Action: 批量获取 R2 签名 URL
 */
export async function getBatchSignedUrlsAction(r2Keys: string[]) {
  try {
    if (!r2Keys || r2Keys.length === 0) {
      return { success: true, signedUrls: {} };
    }

    // 限制单次最多100个
    if (r2Keys.length > 100) {
      return { success: false, error: '单次请求key数量不能超过100' };
    }

    const results = await Promise.allSettled(
      r2Keys.map(async (key) => {
        const url = await getR2SignedUrl(key, R2_SIGNED_URL_EXPIRES); 
        return { key, url };
      })
    );

    const signedUrls: Record<string, string> = {};
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        signedUrls[result.value.key] = result.value.url;
      } else {
        errors.push(r2Keys[index]);
      }
    });

    return {
      success: true,
      signedUrls,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error: any) {
    console.error('批量获取签名 URL 失败:', error);
    return { success: false, error: error.message || '批量获取签名失败' };
  }
}

/**
 * Server Action: 上传文件到 R2
 */
export async function uploadFileToR2Action(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const r2Key = formData.get('r2Key') as string;
    
    if (!file) {
      return { success: false, key: '', error: '没有文件' };
    }

    // 读取文件为 Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const result = await uploadToR2(buffer, r2Key, file.type);
    return result;
  } catch (error: any) {
    console.error('上传文件失败:', error);
    return { success: false, key: '', error: error.message || '上传失败' };
  }
}

/**
 * 检测文件的编程语言
 */
function detectLanguage(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'go': 'Go',
    'rs': 'Rust',
    'rb': 'Ruby',
    'php': 'PHP',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'sql': 'SQL',
    'sh': 'Shell',
    'bash': 'Bash',
  };
  return ext ? languageMap[ext] : undefined;
}

/**
 * Server Action: 上传代码文件到代码库
 * 代码内容直接存储在数据库中
 */
export async function uploadCodeToRepositoryAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const repositoryId = formData.get('repositoryId') as string;
    const filePath = formData.get('path') as string || file.name;
    
    if (!file) {
      return { success: false, error: '没有文件' };
    }

    if (!repositoryId) {
      return { success: false, error: '没有提供代码库 ID' };
    }

    // 标准化路径
    const sanitizedPath = filePath.replace(/\\/g, '/');

    // 读取文件内容为文本
    const content = await file.text();

    // 检测编程语言
    const language = detectLanguage(file.name);

    // 保存到数据库（包含代码内容）
    try {
      await caller.codeRepository.addCode({
        repositoryId,
        name: file.name,
        path: sanitizedPath,
        content, // 直接存储代码内容
        fileSize: file.size,
        language,
      });
    } catch (dbError: any) {
      console.error('保存到数据库失败:', dbError);
      return { success: false, error: '保存到数据库失败: ' + dbError.message };
    }

    // 重新验证缓存
    revalidatePath(`/admin/dashboard/resources/code/${repositoryId}`);
    revalidatePath('/admin/dashboard/resources/code');

    return { 
      success: true, 
      message: '上传成功',
      data: { filename: file.name, path: sanitizedPath }
    };

  } catch (error: any) {
    console.error('上传代码文件失败:', error);
    return { success: false, error: error.message || '上传失败' };
  }
}

/**
 * Server Action: 获取音乐上传的预签名 URL
 */
export async function getMusicUploadUrlAction(data: {
  albumId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  try {
    const { albumId, fileName, fileType, fileSize } = data;

    // 生成 R2 key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `music/${albumId}/${timestamp}-${sanitizedFileName}`;

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
    console.error('获取音乐上传 URL 失败:', error);
    return { success: false, error: error.message || '获取上传 URL 失败' };
  }
}

/**
 * Server Action: 保存音乐记录到数据库
 */
export async function saveMusicRecordAction(data: {
  albumId: string;
  fileName: string;
  r2Key: string;
  fileSize: number;
  mimeType: string;
  artist?: string;
  duration?: number;
  bitrate?: number;
}) {
  try {
    const { albumId, fileName, r2Key, fileSize, mimeType, artist, duration, bitrate } = data;

    // 保存到数据库
    await caller.musicAlbum.addMusic({
      albumId,
      name: fileName,
      r2Key,
      fileSize,
      mimeType,
      artist,
      duration,
      bitrate,
    });

    // 重新验证缓存
    revalidatePath(`/admin/dashboard/resources/music/${albumId}`);
    revalidatePath('/admin/dashboard/resources/music');

    return {
      success: true,
      message: '音乐记录保存成功',
    };
  } catch (error: any) {
    console.error('保存音乐记录失败:', error);
    return { success: false, error: error.message || '保存音乐记录失败' };
  }
}

/**
 * Server Action: 获取视频上传的预签名 URL
 */
export async function getVideoUploadUrlAction(data: {
  collectionId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  try {
    const { collectionId, fileName, fileType, fileSize } = data;

    // 生成 R2 key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `video/${collectionId}/${timestamp}-${sanitizedFileName}`;

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
    console.error('获取视频上传 URL 失败:', error);
    return { success: false, error: error.message || '获取上传 URL 失败' };
  }
}

/**
 * Server Action: 保存视频记录到数据库
 */
export async function saveVideoRecordAction(data: {
  collectionId: string;
  fileName: string;
  r2Key: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  width?: number;
  height?: number;
}) {
  try {
    const { collectionId, fileName, r2Key, fileSize, mimeType, duration, width, height } = data;

    // 保存到数据库
    await caller.videoCollection.addVideo({
      collectionId,
      name: fileName,
      r2Key,
      fileSize,
      mimeType,
      duration,
      width,
      height,
    });

    // 重新验证缓存
    revalidatePath(`/admin/dashboard/resources/video/${collectionId}`);
    revalidatePath('/admin/dashboard/resources/video');

    return {
      success: true,
      message: '视频记录保存成功',
    };
  } catch (error: any) {
    console.error('保存视频记录失败:', error);
    return { success: false, error: error.message || '保存视频记录失败' };
  }
}

/**
 * Server Action: 获取图片上传的预签名 URL
 */
export async function getImageUploadUrlAction(data: {
  galleryId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}) {
  try {
    const { galleryId, fileName, fileType, fileSize } = data;

    // 生成 R2 key
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const r2Key = `images/${galleryId}/${timestamp}-${sanitizedFileName}`;

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
    console.error('获取图片上传 URL 失败:', error);
    return { success: false, error: error.message || '获取上传 URL 失败' };
  }
}

/**
 * Server Action: 保存图片记录到数据库
 */
export async function saveImageRecordAction(data: {
  galleryId: string;
  fileName: string;
  r2Key: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  alt?: string;
}) {
  try {
    const { galleryId, fileName, r2Key, fileSize, mimeType, width, height, alt } = data;

    // 保存到数据库
    await caller.imageGallery.addImage({
      galleryId,
      name: fileName,
      r2Key,
      fileSize,
      mimeType,
      width,
      height,
      alt,
    });

    // 重新验证缓存
    revalidatePath(`/admin/dashboard/resources/image/${galleryId}`);
    revalidatePath('/admin/dashboard/resources/image');

    return {
      success: true,
      message: '图片记录保存成功',
    };
  } catch (error: any) {
    console.error('保存图片记录失败:', error);
    return { success: false, error: error.message || '保存图片记录失败' };
  }
}

/**
 * Server Action: 从 R2 删除单个文件
 */
export async function deleteFromR2Action(r2Key: string) {
  try {
    const { deleteFromR2 } = await import('@/lib/r2-utils');
    const result = await deleteFromR2(r2Key);
    
    if (!result.success) {
      throw new Error(result.error || '删除失败');
    }

    return {
      success: true,
      message: '文件删除成功',
    };
  } catch (error: any) {
    console.error('删除 R2 文件失败:', error);
    return { success: false, error: error.message || '删除 R2 文件失败' };
  }
}

/**
 * Server Action: 从 R2 批量删除文件
 */
export async function batchDeleteFromR2Action(r2Keys: string[]) {
  try {
    if (!r2Keys || r2Keys.length === 0) {
      return { success: true, message: '没有需要删除的文件' };
    }

    const { batchDeleteFromR2 } = await import('@/lib/r2-utils');
    const result = await batchDeleteFromR2(r2Keys);
    
    if (!result.success && result.failedKeys && result.failedKeys.length > 0) {
      console.warn('部分文件删除失败:', result.failedKeys);
      return {
        success: false,
        error: `${result.failedKeys.length} 个文件删除失败`,
        failedKeys: result.failedKeys,
      };
    }

    return {
      success: true,
      message: `成功删除 ${r2Keys.length} 个文件`,
    };
  } catch (error: any) {
    console.error('批量删除 R2 文件失败:', error);
    return { success: false, error: error.message || '批量删除 R2 文件失败' };
  }
}

/**
 * 检测文件的编程语言（与上面的 detectLanguage 保持一致）
 */
function detectLanguageForZip(filename: string): string | undefined {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'JavaScript',
    'jsx': 'JavaScript',
    'ts': 'TypeScript',
    'tsx': 'TypeScript',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'go': 'Go',
    'rs': 'Rust',
    'rb': 'Ruby',
    'php': 'PHP',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'html': 'HTML',
    'css': 'CSS',
    'scss': 'SCSS',
    'json': 'JSON',
    'xml': 'XML',
    'yaml': 'YAML',
    'yml': 'YAML',
    'md': 'Markdown',
    'sql': 'SQL',
    'sh': 'Shell',
    'bash': 'Bash',
  };
  return ext ? languageMap[ext] : undefined;
}

/**
 * Server Action: 上传并解压 ZIP 文件到代码库
 * 注意：暂时只支持 ZIP 文件，RAR 支持因 WASM 兼容性问题暂时禁用
 */
export async function uploadZipToRepositoryAction(formData: FormData) {
  try {
    const file = formData.get('file') as File;
    const repositoryId = formData.get('repositoryId') as string;
    
    if (!file) {
      return { success: false, error: '没有文件' };
    }

    if (!repositoryId) {
      return { success: false, error: '没有提供代码库 ID' };
    }

    // 验证文件类型
    const fileName = file.name.toLowerCase();
    const isZip = fileName.endsWith('.zip');
    
    if (!isZip) {
      return { success: false, error: '请上传 ZIP 文件（暂不支持 RAR）' };
    }

    // 读取文件
    const arrayBuffer = await file.arrayBuffer();
    
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // 处理 ZIP 文件
    const zip = await JSZip.loadAsync(arrayBuffer);

    for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
      // 跳过目录和隐藏文件
      if (zipEntry.dir || relativePath.startsWith('.') || relativePath.includes('/__MACOSX/')) {
        continue;
      }

      try {
        // 读取文件内容
        const content = await zipEntry.async('string');
        const fileSize = content.length;

        // 标准化路径
        const sanitizedPath = relativePath.replace(/\\/g, '/');
        const fileNameOnly = sanitizedPath.split('/').pop() || relativePath;

        // 检测编程语言
        const language = detectLanguageForZip(fileNameOnly);

        // 保存到数据库
        await caller.codeRepository.addCode({
          repositoryId,
          name: fileNameOnly,
          path: sanitizedPath,
          content,
          fileSize,
          language,
        });

        successCount++;
      } catch (error: any) {
        failedCount++;
        errors.push(`${relativePath}: ${error.message}`);
        console.error(`处理文件 ${relativePath} 失败:`, error);
      }
    }

    // 重新验证缓存
    revalidatePath(`/admin/dashboard/resources/code/${repositoryId}`);
    revalidatePath('/admin/dashboard/resources/code');

    if (failedCount > 0) {
      return {
        success: true,
        message: `成功上传 ${successCount} 个文件，失败 ${failedCount} 个`,
        data: { successCount, failedCount, errors },
      };
    }

    return {
      success: true,
      message: `成功上传 ${successCount} 个文件`,
      data: { successCount, failedCount: 0 },
    };

  } catch (error: any) {
    console.error('上传压缩文件失败:', error);
    return { success: false, error: error.message || '上传失败' };
  }
}
