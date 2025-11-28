import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * 创建 R2 客户端
 */
export function createR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
    },
  });
}

/**
 * 上传文件到 R2
 * @param file - 文件 Buffer 或 Blob
 * @param key - R2 存储的 key（路径）
 * @param contentType - 文件 MIME 类型
 */
export async function uploadToR2(
  file: Buffer | Blob,
  key: string,
  contentType: string
): Promise<{ success: boolean; key: string; error?: string }> {
  try {
    const client = createR2Client();
    const bucket = process.env.R2_BUCKET_NAME!;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file as Buffer,
      ContentType: contentType,
    });

    await client.send(command);

    return { success: true, key };
  } catch (error: any) {
    console.error('R2 上传错误:', error);
    return { success: false, key, error: error.message };
  }
}

/**
 * 从 R2 获取文件的预签名 URL（仅服务端）
 * @param key - R2 存储的 key（路径）
 * @param expiresIn - URL 有效期（秒），默认 3小时
 */
export async function getR2SignedUrl(
  key: string,
  expiresIn: number = 60 * 60 * 3
): Promise<string> {
  try {
    const client = createR2Client();
    const bucket = process.env.R2_BUCKET_NAME!;

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error: any) {
    console.error('R2 获取签名 URL 错误:', error);
    throw new Error(`无法获取文件 URL: ${error.message}`);
  }
}

/**
 * 获取 R2 预签名上传 URL（用于客户端直接上传）
 * @param key - R2 存储的 key（路径）
 * @param contentType - 文件 MIME 类型
 * @param expiresIn - URL 有效期（秒），默认 1小时
 */
export async function getR2PresignedPutUrl(
  key: string,
  contentType: string,
  expiresIn: number = 60 * 60
): Promise<string> {
  try {
    const client = createR2Client();
    const bucket = process.env.R2_BUCKET_NAME!;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error: any) {
    console.error('R2 获取预签名上传 URL 错误:', error);
    throw new Error(`无法获取上传 URL: ${error.message}`);
  }
}

/**
 * 从 R2 删除文件
 * @param key - R2 存储的 key（路径）
 */
export async function deleteFromR2(
  key: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createR2Client();
    const bucket = process.env.R2_BUCKET_NAME!;

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await client.send(command);

    return { success: true };
  } catch (error: any) {
    console.error('R2 删除错误:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 批量删除 R2 文件
 * @param keys - R2 存储的 key 数组
 */
export async function batchDeleteFromR2(
  keys: string[]
): Promise<{ success: boolean; failedKeys?: string[] }> {
  const results = await Promise.allSettled(
    keys.map(key => deleteFromR2(key))
  );

  const failedKeys = results
    .map((result, index) => 
      result.status === 'rejected' || !result.value.success ? keys[index] : null
    )
    .filter(Boolean) as string[];

  return {
    success: failedKeys.length === 0,
    failedKeys: failedKeys.length > 0 ? failedKeys : undefined,
  };
}
