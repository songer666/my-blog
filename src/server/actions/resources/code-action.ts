"use server";

import { db } from "@/db";
import { codeRepository } from '@/db/schema/resources';
import { eq, and } from "drizzle-orm";
import { isNil } from 'lodash';
import type { RepositoryCodeItem, DemoImageItem } from "@/server/types/resources-type";
import JSZip from "jszip";

/**
 * 获取所有代码库（管理员用）
 */
export async function getAllRepositories() {
  const repositories = await db.query.codeRepository.findMany({
    orderBy: (repo, { desc }) => [desc(repo.createdAt)],
  });
  return repositories;
}

/**
 * 获取所有公开的代码库（前台用）
 */
export async function getAllPublicRepositories() {
  const repositories = await db.query.codeRepository.findMany({
    where: eq(codeRepository.isPublic, true),
    orderBy: (repo, { desc }) => [desc(repo.createdAt)],
  });
  return repositories;
}

/**
 * 根据 ID 获取代码库
 */
export async function getRepositoryById(id: string) {
  const repository = await db.query.codeRepository.findFirst({
    where: eq(codeRepository.id, id),
  });
  return repository;
}

/**
 * 根据 slug 获取代码库（管理员用）
 */
export async function getRepositoryBySlug(slug: string) {
  const repository = await db.query.codeRepository.findFirst({
    where: eq(codeRepository.slug, slug),
  });
  return repository;
}

/**
 * 根据 slug 获取公开的代码库（前台用）
 */
export async function getPublicRepositoryBySlug(slug: string) {
  const repository = await db.query.codeRepository.findFirst({
    where: and(
      eq(codeRepository.slug, slug),
      eq(codeRepository.isPublic, true)
    ),
  });
  return repository;
}

/**
 * 创建代码库
 */
export async function createRepository(data: {
  title: string;
  slug: string;
  description?: string;
  keywords?: string[];
  relatedPostId?: string;
  isPublic?: boolean;
  sort?: number;
  createdAt?: Date;
}) {
  // 检查 slug 是否已存在
  const existing = await getRepositoryBySlug(data.slug);
  if (existing) {
    return { success: false, error: 'Slug 已存在' };
  }

  const [newRepository] = await db
    .insert(codeRepository)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      keywords: data.keywords || null,
      relatedPostId: data.relatedPostId || null,
      items: [],
      demoImages: [],
      itemCount: 0,
      totalSize: 0,
      isPublic: data.isPublic ?? true,
      sort: data.sort ?? 0,
      createdAt: data.createdAt || new Date(),
    })
    .returning();
  
  if (isNil(newRepository)) {
    return { success: false, error: '创建失败' };
  }
  
  return { success: true, data: newRepository };
}

/**
 * 更新代码库
 */
export async function updateRepository(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string | null;
    keywords?: string[] | null;
    relatedPostId?: string | null;
    isPublic?: boolean;
    sort?: number;
    createdAt?: Date;
  }
) {
  // 如果更新 slug，检查是否已存在
  if (data.slug) {
    const existing = await getRepositoryBySlug(data.slug);
    if (existing && existing.id !== id) {
      return { success: false, error: 'Slug 已存在' };
    }
  }

  const [updatedRepository] = await db
    .update(codeRepository)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(codeRepository.id, id))
    .returning();

  if (isNil(updatedRepository)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedRepository };
}

/**
 * 删除代码库
 */
export async function deleteRepository(id: string) {
  const repository = await getRepositoryById(id);
  
  if (!repository) {
    return { success: false, error: '代码库不存在' };
  }

  // 删除所有关联的 R2 演示图片
  const demoImages = repository.demoImages as DemoImageItem[];
  if (demoImages && demoImages.length > 0) {
    const r2Keys = demoImages.map(img => img.r2Key);
    const { batchDeleteFromR2Action } = await import('./r2-action');
    const deleteResult = await batchDeleteFromR2Action(r2Keys);
    
    if (!deleteResult.success) {
      console.warn('删除演示图片时出现问题:', deleteResult.error);
      // 继续删除数据库记录，即使 R2 删除失败
    }
  }

  // 从数据库删除（代码内容已存储在数据库中，随记录一起删除）
  await db.delete(codeRepository).where(eq(codeRepository.id, id));

  return { success: true };
}

/**
 * 添加代码文件到代码库
 */
export async function addCodeToRepository(
  repositoryId: string,
  codeData: {
    name: string;
    path: string;
    content: string; // 代码内容
    fileSize: number;
    language?: string;
  }
) {
  const repository = await getRepositoryById(repositoryId);
  
  if (!repository) {
    return { success: false, error: '代码库不存在' };
  }

  const newCodeItem: RepositoryCodeItem = {
    id: crypto.randomUUID(),
    name: codeData.name,
    path: codeData.path,
    content: codeData.content,
    fileSize: codeData.fileSize,
    language: codeData.language,
    uploadedAt: new Date().toISOString(),
  };

  const updatedItems = [...(repository.items as RepositoryCodeItem[]), newCodeItem];

  const [updatedRepository] = await db
    .update(codeRepository)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: updatedItems.reduce((sum, item) => sum + item.fileSize, 0),
      updatedAt: new Date(),
    })
    .where(eq(codeRepository.id, repositoryId))
    .returning();

  if (isNil(updatedRepository)) {
    return { success: false, error: '添加失败' };
  }

  return { success: true, data: updatedRepository };
}

/**
 * 从代码库删除代码文件
 */
export async function removeCodeFromRepository(repositoryId: string, codeId: string) {
  const repository = await getRepositoryById(repositoryId);
  
  if (!repository) {
    return { success: false, error: '代码库不存在' };
  }

  const codeItem = (repository.items as RepositoryCodeItem[]).find(
    (item) => item.id === codeId
  );

  if (!codeItem) {
    return { success: false, error: '代码文件不存在' };
  }

  // 从数据库删除（代码内容存储在数据库中）
  const updatedItems = (repository.items as RepositoryCodeItem[]).filter(
    (item) => item.id !== codeId
  );

  const [updatedRepository] = await db
    .update(codeRepository)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: updatedItems.reduce((sum, item) => sum + item.fileSize, 0),
      updatedAt: new Date(),
    })
    .where(eq(codeRepository.id, repositoryId))
    .returning();

  if (isNil(updatedRepository)) {
    return { success: false, error: '删除失败' };
  }

  return { success: true, data: updatedRepository };
}

/**
 * 更新代码库中的代码文件信息
 */
export async function updateRepositoryCode(
  repositoryId: string,
  codeId: string,
  data: {
    name?: string;
    path?: string;
  }
) {
  const repository = await getRepositoryById(repositoryId);
  
  if (!repository) {
    return { success: false, error: '代码库不存在' };
  }

  const updatedItems = (repository.items as RepositoryCodeItem[]).map((item) => {
    if (item.id === codeId) {
      return { ...item, ...data };
    }
    return item;
  });

  const [updatedRepository] = await db
    .update(codeRepository)
    .set({
      items: updatedItems,
      updatedAt: new Date(),
    })
    .where(eq(codeRepository.id, repositoryId))
    .returning();

  if (isNil(updatedRepository)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedRepository };
}

/**
 * 添加演示图片到代码库
 */
export async function addDemoImageToRepository(
  repositoryId: string,
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
  const repository = await getRepositoryById(repositoryId);
  
  if (!repository) {
    return { success: false, error: '代码库不存在' };
  }

  const newImage: DemoImageItem = {
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

  const updatedImages = [...(repository.demoImages as DemoImageItem[]), newImage];

  const [updatedRepository] = await db
    .update(codeRepository)
    .set({
      demoImages: updatedImages,
      updatedAt: new Date(),
    })
    .where(eq(codeRepository.id, repositoryId))
    .returning();

  if (isNil(updatedRepository)) {
    return { success: false, error: '添加失败' };
  }

  return { success: true, data: updatedRepository };
}

/**
 * 从代码库删除演示图片
 */
export async function removeDemoImageFromRepository(repositoryId: string, imageId: string) {
  const repository = await getRepositoryById(repositoryId);
  
  if (!repository) {
    return { success: false, error: '代码库不存在' };
  }

  const image = (repository.demoImages as DemoImageItem[]).find(
    (item) => item.id === imageId
  );

  if (!image) {
    return { success: false, error: '图片不存在' };
  }

  // 从 R2 删除图片文件
  if (image.r2Key) {
    const { deleteFromR2Action } = await import('./r2-action');
    const deleteResult = await deleteFromR2Action(image.r2Key);
    
    if (!deleteResult.success) {
      console.warn('删除 R2 图片文件时出现问题:', deleteResult.error);
      // 继续删除数据库记录，即使 R2 删除失败
    }
  }

  const updatedImages = (repository.demoImages as DemoImageItem[]).filter(
    (item) => item.id !== imageId
  );

  const [updatedRepository] = await db
    .update(codeRepository)
    .set({
      demoImages: updatedImages,
      updatedAt: new Date(),
    })
    .where(eq(codeRepository.id, repositoryId))
    .returning();

  if (isNil(updatedRepository)) {
    return { success: false, error: '删除失败' };
  }

  return { success: true, data: updatedRepository, removedImage: image };
}
