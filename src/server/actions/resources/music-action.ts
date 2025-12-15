import { db } from "@/db";
import { musicAlbum } from '@/db/schema/resources';
import { eq, and } from "drizzle-orm";
import { isNil } from 'lodash';
import { batchDeleteFromR2 } from "@/lib/r2-utils";
import type { AlbumMusicItem } from "@/server/types/resources-type";

/**
 * 获取所有音乐专辑（管理员用）
 */
export async function getAllAlbums() {
  const albums = await db.query.musicAlbum.findMany({
    orderBy: (album, { desc }) => [desc(album.createdAt)],
    columns: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
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
  return albums;
}

/**
 * 获取所有公开的音乐专辑（前台用）
 */
export async function getAllPublicAlbums() {
  const albums = await db.query.musicAlbum.findMany({
    where: eq(musicAlbum.isPublic, true),
    orderBy: (album, { desc }) => [desc(album.createdAt)],
    columns: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
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
  return albums;
}

/**
 * 根据 ID 获取音乐专辑
 */
export async function getAlbumById(id: string) {
  const album = await db.query.musicAlbum.findFirst({
    where: eq(musicAlbum.id, id),
  });
  return album;
}

/**
 * 根据 slug 获取音乐专辑（管理员用）
 */
export async function getAlbumBySlug(slug: string) {
  const album = await db.query.musicAlbum.findFirst({
    where: eq(musicAlbum.slug, slug),
  });
  return album;
}

/**
 * 根据 slug 获取公开的音乐专辑（前台用）
 */
export async function getPublicAlbumBySlug(slug: string) {
  const album = await db.query.musicAlbum.findFirst({
    where: and(
      eq(musicAlbum.slug, slug),
      eq(musicAlbum.isPublic, true)
    ),
  });
  return album;
}

/**
 * 创建音乐专辑
 */
export async function createAlbum(data: {
  title: string;
  slug: string;
  description?: string;
  coverImage?: string;
  keywords?: string[];
  tags?: string[];
  isPublic?: boolean;
  sort?: number;
  createdAt?: Date;
}) {
  // 检查 slug 是否已存在
  const existing = await getAlbumBySlug(data.slug);
  if (existing) {
    return { success: false, error: 'Slug 已存在' };
  }

  const [newAlbum] = await db
    .insert(musicAlbum)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description || null,
      coverImage: data.coverImage || null,
      keywords: data.keywords || null,
      tags: data.tags || null,
      items: [],
      itemCount: 0,
      totalSize: 0,
      isPublic: data.isPublic ?? true,
      sort: data.sort ?? 0,
      createdAt: data.createdAt || new Date(),
    })
    .returning();
  
  if (isNil(newAlbum)) {
    return { success: false, error: '创建失败' };
  }
  
  return { success: true, data: newAlbum };
}

/**
 * 更新音乐专辑
 */
export async function updateAlbum(
  id: string,
  data: {
    title?: string;
    slug?: string;
    description?: string | null;
    coverImage?: string | null;
    keywords?: string[] | null;
    tags?: string[] | null;
    isPublic?: boolean;
    sort?: number;
    createdAt?: Date;
  }
) {
  // 如果更新 slug，检查是否已存在
  if (data.slug) {
    const existing = await getAlbumBySlug(data.slug);
    if (existing && existing.id !== id) {
      return { success: false, error: 'Slug 已存在' };
    }
  }

  const [updatedAlbum] = await db
    .update(musicAlbum)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(musicAlbum.id, id))
    .returning();

  if (isNil(updatedAlbum)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedAlbum };
}

/**
 * 删除音乐专辑（包括删除 R2 中的所有音乐文件）
 */
export async function deleteAlbum(id: string) {
  const album = await getAlbumById(id);
  
  if (!album) {
    return { success: false, error: '专辑不存在' };
  }

  // 删除 R2 中的所有音乐文件
  if (album.items && album.items.length > 0) {
    const keys = album.items.map((item: AlbumMusicItem) => item.r2Key);
    // 同时删除封面图片
    const coverKeys = album.items
      .filter((item: AlbumMusicItem) => item.coverKey)
      .map((item: AlbumMusicItem) => item.coverKey!);
    
    const allKeys = [...keys, ...coverKeys];
    
    if (allKeys.length > 0) {
      await batchDeleteFromR2(allKeys);
    }
  }

  // 从数据库删除
  await db.delete(musicAlbum).where(eq(musicAlbum.id, id));

  return { success: true };
}

/**
 * 添加音乐到专辑
 */
export async function addMusicToAlbum(
  albumId: string,
  musicData: {
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    artist?: string;
    duration?: number;
    bitrate?: number;
    coverKey?: string;
  }
) {
  const album = await getAlbumById(albumId);
  
  if (!album) {
    return { success: false, error: '专辑不存在' };
  }

  const newMusic: AlbumMusicItem = {
    id: crypto.randomUUID(),
    name: musicData.name,
    r2Key: musicData.r2Key,
    fileSize: musicData.fileSize,
    mimeType: musicData.mimeType,
    artist: musicData.artist,
    duration: musicData.duration,
    bitrate: musicData.bitrate,
    coverKey: musicData.coverKey,
    uploadedAt: new Date().toISOString(),
  };

  const updatedItems = [...(album.items as AlbumMusicItem[]), newMusic];

  const [updatedAlbum] = await db
    .update(musicAlbum)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: updatedItems.reduce((sum, item) => sum + item.fileSize, 0),
      updatedAt: new Date(),
    })
    .where(eq(musicAlbum.id, albumId))
    .returning();

  if (isNil(updatedAlbum)) {
    return { success: false, error: '添加失败' };
  }

  return { success: true, data: updatedAlbum };
}

/**
 * 从专辑删除音乐
 */
export async function removeMusicFromAlbum(albumId: string, musicId: string) {
  const album = await getAlbumById(albumId);
  
  if (!album) {
    return { success: false, error: '专辑不存在' };
  }

  const musicItem = (album.items as AlbumMusicItem[]).find(
    (item) => item.id === musicId
  );

  if (!musicItem) {
    return { success: false, error: '音乐不存在' };
  }

  // 从 R2 删除音乐文件
  const keysToDelete = [musicItem.r2Key];
  if (musicItem.coverKey) {
    keysToDelete.push(musicItem.coverKey);
  }
  await batchDeleteFromR2(keysToDelete);

  // 从数据库删除
  const updatedItems = (album.items as AlbumMusicItem[]).filter(
    (item) => item.id !== musicId
  );

  const [updatedAlbum] = await db
    .update(musicAlbum)
    .set({
      items: updatedItems,
      itemCount: updatedItems.length,
      totalSize: updatedItems.reduce((sum, item) => sum + item.fileSize, 0),
      updatedAt: new Date(),
    })
    .where(eq(musicAlbum.id, albumId))
    .returning();

  if (isNil(updatedAlbum)) {
    return { success: false, error: '删除失败' };
  }

  return { success: true, data: updatedAlbum };
}

/**
 * 更新专辑中的音乐信息
 */
export async function updateAlbumMusic(
  albumId: string,
  musicId: string,
  data: {
    name?: string;
    artist?: string;
  }
) {
  const album = await getAlbumById(albumId);
  
  if (!album) {
    return { success: false, error: '专辑不存在' };
  }

  const updatedItems = (album.items as AlbumMusicItem[]).map((item) => {
    if (item.id === musicId) {
      return { ...item, ...data };
    }
    return item;
  });

  const [updatedAlbum] = await db
    .update(musicAlbum)
    .set({
      items: updatedItems,
      updatedAt: new Date(),
    })
    .where(eq(musicAlbum.id, albumId))
    .returning();

  if (isNil(updatedAlbum)) {
    return { success: false, error: '更新失败' };
  }

  return { success: true, data: updatedAlbum };
}
