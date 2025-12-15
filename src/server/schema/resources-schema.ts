import { z } from "zod";

// ==================== 图库 Schema ====================

// 图片项 Schema
export const galleryImageItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string().optional(),
  uploadedAt: z.string(),
});

export const imageGallerySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  description: z.string().nullable(),
  keywords: z.array(z.string()).nullable(),
  tags: z.array(z.string()).nullable(),
  items: z.array(galleryImageItemSchema),
  itemCount: z.number(),
  totalSize: z.number(),
  isPublic: z.boolean(),
  sort: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createImageGallerySchema = z.object({
  title: z.string().min(2, '标题至少需要2个字符'),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  sort: z.number().default(0),
  createdAt: z.date().optional(),
});

export const updateImageGallerySchema = z.object({
  id: z.string(),
  title: z.string().min(2, '标题至少需要2个字符').optional(),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符').optional(),
  description: z.string().nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isPublic: z.boolean().optional(),
  sort: z.number().optional(),
  createdAt: z.date().optional(),
});

// 图库列表项 Schema（不包含 items，用于列表页面）
export const imageGalleryListItemSchema = imageGallerySchema.omit({ items: true });

export const imageGalleryListSchema = z.array(imageGalleryListItemSchema);

// 添加图片到图库
export const addImageToGallerySchema = z.object({
  galleryId: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string().optional(),
});

// 从图库删除图片
export const removeImageFromGallerySchema = z.object({
  galleryId: z.string(),
  imageId: z.string(),
});

// 更新图库中的图片
export const updateGalleryImageSchema = z.object({
  galleryId: z.string(),
  imageId: z.string(),
  name: z.string().optional(),
  alt: z.string().optional(),
});

// ==================== 曲库 Schema ====================

// 音乐项 Schema
export const albumMusicItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  artist: z.string().optional(),
  duration: z.number().optional(),
  bitrate: z.number().optional(),
  coverKey: z.string().optional(),
  uploadedAt: z.string(),
});

export const musicAlbumSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  keywords: z.array(z.string()).nullable(),
  tags: z.array(z.string()).nullable(),
  items: z.array(albumMusicItemSchema),
  itemCount: z.number(),
  totalSize: z.number(),
  isPublic: z.boolean(),
  sort: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createMusicAlbumSchema = z.object({
  title: z.string().min(2, '标题至少需要2个字符'),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  sort: z.number().default(0),
  createdAt: z.date().optional(),
});

export const updateMusicAlbumSchema = z.object({
  id: z.string(),
  title: z.string().min(2, '标题至少需要2个字符').optional(),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符').optional(),
  description: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  isPublic: z.boolean().optional(),
  sort: z.number().optional(),
  createdAt: z.date().optional(),
});

// 曲库列表项 Schema（不包含 items，用于列表页面）
export const musicAlbumListItemSchema = musicAlbumSchema.omit({ items: true });

export const musicAlbumListSchema = z.array(musicAlbumListItemSchema);

// 添加音乐到专辑
export const addMusicToAlbumSchema = z.object({
  albumId: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  artist: z.string().optional(),
  duration: z.number().optional(),
  bitrate: z.number().optional(),
  coverKey: z.string().optional(),
});

// 从专辑删除音乐
export const removeMusicFromAlbumSchema = z.object({
  albumId: z.string(),
  musicId: z.string(),
});

// 更新专辑中的音乐
export const updateAlbumMusicSchema = z.object({
  albumId: z.string(),
  musicId: z.string(),
  name: z.string().optional(),
  artist: z.string().optional(),
});

// ==================== 视频集 Schema ====================

// 视频项 Schema
export const collectionVideoItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  coverKey: z.string().optional(),
  uploadedAt: z.string(),
});

export const videoCollectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  coverImage: z.string().nullable(),
  keywords: z.array(z.string()).nullable(),
  items: z.array(collectionVideoItemSchema),
  itemCount: z.number(),
  totalSize: z.number(),
  isPublic: z.boolean(),
  sort: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createVideoCollectionSchema = z.object({
  title: z.string().min(2, '标题至少需要2个字符'),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  isPublic: z.boolean().default(true),
  sort: z.number().default(0),
});

export const updateVideoCollectionSchema = z.object({
  id: z.string(),
  title: z.string().min(2, '标题至少需要2个字符').optional(),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符').optional(),
  description: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  isPublic: z.boolean().optional(),
  sort: z.number().optional(),
});

export const videoCollectionListSchema = z.array(videoCollectionSchema);

// 添加视频到视频集
export const addVideoToCollectionSchema = z.object({
  collectionId: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  duration: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  coverKey: z.string().optional(),
});

// 从视频集删除视频
export const removeVideoFromCollectionSchema = z.object({
  collectionId: z.string(),
  videoId: z.string(),
});

// 更新视频集中的视频
export const updateCollectionVideoSchema = z.object({
  collectionId: z.string(),
  videoId: z.string(),
  name: z.string().optional(),
});

// ==================== 代码库 Schema ====================

// 代码文件项 Schema
export const repositoryCodeItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  content: z.string().optional(), // 代码内容存储在数据库（新）
  r2Key: z.string().optional(), // 兼容旧数据
  fileSize: z.number(),
  language: z.string().optional(),
  uploadedAt: z.string(),
}).refine(
  (data) => data.content !== undefined || data.r2Key !== undefined,
  { message: "必须提供 content 或 r2Key 之一" }
);

// 演示图片项 Schema
export const demoImageItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string().optional(),
  uploadedAt: z.string(),
});

export const codeRepositorySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  keywords: z.array(z.string()).nullable(),
  items: z.array(repositoryCodeItemSchema),
  demoImages: z.array(demoImageItemSchema),
  relatedPostId: z.string().nullable(),
  itemCount: z.number(),
  totalSize: z.number(),
  isPublic: z.boolean(),
  sort: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createCodeRepositorySchema = z.object({
  title: z.string().min(2, '标题至少需要2个字符'),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符'),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  relatedPostId: z.string().optional(),
  isPublic: z.boolean().default(true),
  sort: z.number().default(0),
  createdAt: z.date().optional(),
});

export const updateCodeRepositorySchema = z.object({
  id: z.string(),
  title: z.string().min(2, '标题至少需要2个字符').optional(),
  slug: z.string().min(1, 'Slug 不能为空').regex(/^[a-z0-9-]+$/, 'Slug 只能包含小写字母、数字和连字符').optional(),
  description: z.string().nullable().optional(),
  keywords: z.array(z.string()).nullable().optional(),
  relatedPostId: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  sort: z.number().optional(),
  createdAt: z.date().optional(),
});

// 代码库列表项 Schema（不包含 items 和 demoImages，用于列表页面）
export const codeRepositoryListItemSchema = codeRepositorySchema.omit({ items: true, demoImages: true });

export const codeRepositoryListSchema = z.array(codeRepositoryListItemSchema);

// 向代码库添加代码文件
export const addCodeToRepositorySchema = z.object({
  repositoryId: z.string(),
  name: z.string(),
  path: z.string(),
  content: z.string(), // 代码内容
  fileSize: z.number(),
  language: z.string().optional(),
});

// 从代码库删除代码文件
export const removeCodeFromRepositorySchema = z.object({
  repositoryId: z.string(),
  codeId: z.string(),
});

// 更新代码库中的代码文件
export const updateRepositoryCodeSchema = z.object({
  repositoryId: z.string(),
  codeId: z.string(),
  name: z.string().optional(),
  path: z.string().optional(),
});

// 添加演示图片到代码库
export const addDemoImageSchema = z.object({
  repositoryId: z.string(),
  name: z.string(),
  r2Key: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  width: z.number(),
  height: z.number(),
  alt: z.string().optional(),
});

// 从代码库删除演示图片
export const removeDemoImageSchema = z.object({
  repositoryId: z.string(),
  imageId: z.string(),
});
