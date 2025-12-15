import { db } from "@/db";
import { imageGallery } from '@/db/schema/resources';
import { eq, and } from "drizzle-orm";
import { isNil } from 'lodash';
import { batchDeleteFromR2 } from "@/lib/r2-utils";
import type { GalleryImageItem } from "@/server/types/resources-type";

/**
 * 获取所有图库（管理员用）
 */
export async function getAllGalleries() {
  const galleries = await db.query.imageGallery.findMany({
    orderBy: (gallery, { desc }) => [desc(gallery.createdAt)],
    columns: {
      id: true,
      title: true,
      slug: true,
      description: true,
      keywords: true,
      tags: true,
      itemCount: true,
      totalSize: true,
      isPublic: true,
      sort: true,
      createdAt: true,
      updatedAt: true,
      items: false,
    },
  });
  return galleries;
}

/**
 * 获取所有公开的图库（前台用）
 */
export async function getAllPublicGalleries() {
  const galleries = await db.query.imageGallery.findMany({
    where: eq(imageGallery.isPublic, true),
    orderBy: (gallery, { desc }) => [desc(gallery.createdAt)],
  });
  return galleries;
}

/**
 * 根据 ID 获取图库
 */
export async function getGalleryById(id: string) {
  const gallery = await db.query.imageGallery.findFirst({
    where: eq(imageGallery.id, id),
  });
  return gallery;
}

/**
 * 根据 slug 获取图库（管理员用）
 */
export async function getGalleryBySlug(slug: string) {
  const gallery = await db.query.imageGallery.findFirst({
    where: eq(imageGallery.slug, slug),
  });
  return gallery;
}

/**
 * 根据 slug 获取公开的图库（前台用）
 */
export async function getPublicGalleryBySlug(slug: string) {
  const gallery = await db.query.imageGallery.findFirst({
    where: and(
      eq(imageGallery.slug, slug),
      eq(imageGallery.isPublic, true)
    ),
  });
  return gallery;
}

/**
 * 创建图库
 */
export async function createGallery(data: {
  title: string;
  slug: string;
  description?: string;
  keywords?: string[];
  isPublic?: boolean;
  sort?: number;
  createdAt?: Date;
}) {
  // 检查 slug 是否已存在
  const existing = await getGalleryBySlug(data.slug);
  if (existing) {
    return { success: false, error: 'Slug 已存在' };
  }

  const [newGallery] = await db
    .insert(imageGallery)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      keywords: data.keywords || null,
      items: [],
      itemCount: 0,
      totalSize: 0,
      isPublic: data.isPublic ?? true,
      sort: data.sort ?? 0,
      createdAt: data.createdAt || new Date(),
    })
    .returning();
  
  if (isNil(newGallery)) {
    return { success: false, error: '创建失败' };
  }
  
  return { success: true, data: newGallery };
}

/**
 * 更新图库
 */
export async function updateGallery(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string | null;
    keywords?: string[] | null;
    isPublic?: boolean;
    sort?: number;
    createdAt?: Date;
  }
) {
  // 如果更新 slug，检查是否已存在
  if (data.slug) {
    const existing = await getGalleryBySlug(data.slug);
    if (existing && existing.id !== id) {
      return { success: false, error: 'Slug 已存在' };
    }
  }

  const [updatedGallery] = await db
    .update(imageGallery)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(imageGallery.id, id))
    .returning();
  
  if (isNil(updatedGallery)) {
    return { success: false, error: '更新失败' };
  }
  
  return { success: true, data: updatedGallery };
}

/**
 * 删除图库（同时删除 R2 中的所有文件）
 */
export async function deleteGallery(id: string) {
  // 先获取图库信息
  const gallery = await getGalleryById(id);
  if (isNil(gallery)) {
    return { success: false, error: '图库不存在' };
  }

  // 删除数据库记录
  const [deletedGallery] = await db
    .delete(imageGallery)
    .where(eq(imageGallery.id, id))
    .returning({ id: imageGallery.id, items: imageGallery.items });

  if (isNil(deletedGallery)) {
    return { success: false, error: '删除失败' };
  }

  // 删除 R2 中的所有文件
  const keysToDelete = deletedGallery.items.map(item => item.r2Key);
  if (keysToDelete.length > 0) {
    await batchDeleteFromR2(keysToDelete);
  }

  return {
    success: true,
    galleryId: deletedGallery.id,
  };
}

/**
 * 添加图片到图库
 */
export async function addImageToGallery(
  galleryId: string,
  imageData: {
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    alt?: string;
  }
) {
  const gallery = await getGalleryById(galleryId);
  if (isNil(gallery)) {
    return { success: false, error: '图库不存在' };
  }

  const newImage: GalleryImageItem = {
    id: crypto.randomUUID(),
    name: imageData.name,
    r2Key: imageData.r2Key,
    fileSize: imageData.fileSize,
    mimeType: imageData.mimeType,
    width: imageData.width,
    height: imageData.height,
    alt: imageData.alt,
    uploadedAt: new Date().toISOString(),
  };

  const updatedItems = [...gallery.items, newImage];

  const [updatedGallery] = await db
    .update(imageGallery)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: gallery.totalSize + imageData.fileSize,
      updatedAt: new Date(),
    })
    .where(eq(imageGallery.id, galleryId))
    .returning();

  if (isNil(updatedGallery)) {
    return { success: false, error: '添加失败' };
  }

  return { success: true, data: updatedGallery, imageId: newImage.id };
}

/**
 * 从图库删除图片
 */
export async function removeImageFromGallery(galleryId: string, imageId: string) {
  const gallery = await getGalleryById(galleryId);
  if (isNil(gallery)) {
    return { success: false, error: '图库不存在' };
  }

  const imageToRemove = gallery.items.find(item => item.id === imageId);
  if (isNil(imageToRemove)) {
    return { success: false, error: '图片不存在' };
  }

  const updatedItems = gallery.items.filter(item => item.id !== imageId);

  const [updatedGallery] = await db
    .update(imageGallery)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: gallery.totalSize - imageToRemove.fileSize,
      updatedAt: new Date(),
    })
    .where(eq(imageGallery.id, galleryId))
    .returning();

  if (isNil(updatedGallery)) {
    return { success: false, error: '删除失败' };
  }

  // 删除 R2 中的文件
  await batchDeleteFromR2([imageToRemove.r2Key]);

  return { success: true, data: updatedGallery };
}

/**
 * 更新图库中的图片信息
 */
export async function updateGalleryImage(
  galleryId: string,
  imageId: string,
  data: {
    name?: string;
    alt?: string;
  }
) {
  const gallery = await getGalleryById(galleryId);
  if (isNil(gallery)) {
    return { success: false, error: '图库不存在' };
  }

  const imageIndex = gallery.items.findIndex(item => item.id === imageId);
  if (imageIndex === -1) {
    return { success: false, error: '图片不存在' };
  }

  const updatedItems = [...gallery.items];
  updatedItems[imageIndex] = {
    ...updatedItems[imageIndex],
    ...data,
  };

  const [updatedGallery] = await db
    .update(imageGallery)
    .set({
      items: updatedItems,
      updatedAt: new Date(),
    })
    .where(eq(imageGallery.id, galleryId))
    .returning();

  if (isNil(updatedGallery)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedGallery };
}
