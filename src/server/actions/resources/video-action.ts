import { db } from "@/db";
import { videoCollection } from '@/db/schema/resources';
import { eq } from "drizzle-orm";
import { isNil } from 'lodash';
import { batchDeleteFromR2 } from "@/lib/r2-utils";
import type { CollectionVideoItem } from "@/server/types/resources-type";

/**
 * 获取所有视频集
 */
export async function getAllCollections() {
  const collections = await db.query.videoCollection.findMany({
    orderBy: (collection, { desc }) => [desc(collection.createdAt)],
  });
  return collections;
}

/**
 * 根据 ID 获取视频集
 */
export async function getCollectionById(id: string) {
  const collection = await db.query.videoCollection.findFirst({
    where: eq(videoCollection.id, id),
  });
  return collection;
}

/**
 * 根据 slug 获取视频集
 */
export async function getCollectionBySlug(slug: string) {
  const collection = await db.query.videoCollection.findFirst({
    where: eq(videoCollection.slug, slug),
  });
  return collection;
}

/**
 * 创建视频集
 */
export async function createCollection(data: {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  keywords?: string[];
  isPublic?: boolean;
  sort?: number;
}) {
  // 检查 slug 是否已存在
  const existing = await getCollectionBySlug(data.slug);
  if (existing) {
    return { success: false, error: 'Slug 已存在' };
  }

  const [newCollection] = await db
    .insert(videoCollection)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      coverImage: data.coverImage || null,
      keywords: data.keywords || null,
      items: [],
      itemCount: 0,
      totalSize: 0,
      isPublic: data.isPublic ?? true,
      sort: data.sort ?? 0,
    })
    .returning();
  
  if (isNil(newCollection)) {
    return { success: false, error: '创建失败' };
  }
  
  return { success: true, data: newCollection };
}

/**
 * 更新视频集
 */
export async function updateCollection(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string | null;
    coverImage?: string | null;
    keywords?: string[] | null;
    isPublic?: boolean;
    sort?: number;
  }
) {
  // 如果更新 slug，检查是否已存在
  if (data.slug) {
    const existing = await getCollectionBySlug(data.slug);
    if (existing && existing.id !== id) {
      return { success: false, error: 'Slug 已存在' };
    }
  }

  const [updatedCollection] = await db
    .update(videoCollection)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(videoCollection.id, id))
    .returning();

  if (isNil(updatedCollection)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedCollection };
}

/**
 * 删除视频集（包括删除 R2 中的所有视频文件）
 */
export async function deleteCollection(id: string) {
  const collection = await getCollectionById(id);
  
  if (!collection) {
    return { success: false, error: '视频集不存在' };
  }

  // 删除 R2 中的所有视频文件
  if (collection.items && collection.items.length > 0) {
    const keys = collection.items.map((item: CollectionVideoItem) => item.r2Key);
    // 同时删除封面图片
    const coverKeys = collection.items
      .filter((item: CollectionVideoItem) => item.coverKey)
      .map((item: CollectionVideoItem) => item.coverKey!);
    
    const allKeys = [...keys, ...coverKeys];
    
    if (allKeys.length > 0) {
      await batchDeleteFromR2(allKeys);
    }
  }

  // 从数据库删除
  await db.delete(videoCollection).where(eq(videoCollection.id, id));

  return { success: true };
}

/**
 * 添加视频到视频集
 */
export async function addVideoToCollection(
  collectionId: string,
  videoData: {
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    duration?: number;
    width?: number;
    height?: number;
    coverKey?: string;
  }
) {
  const collection = await getCollectionById(collectionId);
  
  if (!collection) {
    return { success: false, error: '视频集不存在' };
  }

  const newVideo: CollectionVideoItem = {
    id: crypto.randomUUID(),
    name: videoData.name,
    r2Key: videoData.r2Key,
    fileSize: videoData.fileSize,
    mimeType: videoData.mimeType,
    duration: videoData.duration,
    width: videoData.width,
    height: videoData.height,
    coverKey: videoData.coverKey,
    uploadedAt: new Date().toISOString(),
  };

  const updatedItems = [...(collection.items as CollectionVideoItem[]), newVideo];

  const [updatedCollection] = await db
    .update(videoCollection)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: updatedItems.reduce((sum, item) => sum + item.fileSize, 0),
      updatedAt: new Date(),
    })
    .where(eq(videoCollection.id, collectionId))
    .returning();

  if (isNil(updatedCollection)) {
    return { success: false, error: '添加失败' };
  }

  return { success: true, data: updatedCollection };
}

/**
 * 从视频集删除视频
 */
export async function removeVideoFromCollection(collectionId: string, videoId: string) {
  const collection = await getCollectionById(collectionId);
  
  if (!collection) {
    return { success: false, error: '视频集不存在' };
  }

  const videoItem = (collection.items as CollectionVideoItem[]).find(
    (item) => item.id === videoId
  );

  if (!videoItem) {
    return { success: false, error: '视频不存在' };
  }

  // 从 R2 删除视频文件
  const keysToDelete = [videoItem.r2Key];
  if (videoItem.coverKey) {
    keysToDelete.push(videoItem.coverKey);
  }
  await batchDeleteFromR2(keysToDelete);

  // 从数据库删除
  const updatedItems = (collection.items as CollectionVideoItem[]).filter(
    (item) => item.id !== videoId
  );

  const [updatedCollection] = await db
    .update(videoCollection)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: updatedItems.reduce((sum, item) => sum + item.fileSize, 0),
      updatedAt: new Date(),
    })
    .where(eq(videoCollection.id, collectionId))
    .returning();

  if (isNil(updatedCollection)) {
    return { success: false, error: '删除失败' };
  }

  return { success: true, data: updatedCollection };
}

/**
 * 更新视频集中的视频信息
 */
export async function updateCollectionVideo(
  collectionId: string,
  videoId: string,
  data: {
    name?: string;
  }
) {
  const collection = await getCollectionById(collectionId);
  
  if (!collection) {
    return { success: false, error: '视频集不存在' };
  }

  const updatedItems = (collection.items as CollectionVideoItem[]).map((item) => {
    if (item.id === videoId) {
      return { ...item, ...data };
    }
    return item;
  });

  const [updatedCollection] = await db
    .update(videoCollection)
    .set({
      items: updatedItems,
      updatedAt: new Date(),
    })
    .where(eq(videoCollection.id, collectionId))
    .returning();

  if (isNil(updatedCollection)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedCollection };
}
