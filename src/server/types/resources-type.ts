import { z } from "zod";
import {
  // 图库
  galleryImageItemSchema,
  imageGallerySchema,
  imageGalleryListSchema,
  createImageGallerySchema,
  updateImageGallerySchema,
  addImageToGallerySchema,
  removeImageFromGallerySchema,
  updateGalleryImageSchema,
  // 曲库
  albumMusicItemSchema,
  musicAlbumSchema,
  musicAlbumListSchema,
  createMusicAlbumSchema,
  updateMusicAlbumSchema,
  // 视频集
  collectionVideoItemSchema,
  videoCollectionSchema,
  videoCollectionListSchema,
  createVideoCollectionSchema,
  updateVideoCollectionSchema,
  // 代码库
  repositoryCodeItemSchema,
  demoImageItemSchema,
  codeRepositorySchema,
  codeRepositoryListSchema,
  createCodeRepositorySchema,
  updateCodeRepositorySchema,
  addDemoImageSchema,
  removeDemoImageSchema,
} from "@/server/schema/resources-schema";

// ==================== 图库类型 ====================

export type GalleryImageItem = z.infer<typeof galleryImageItemSchema>;
export type ImageGallery = z.infer<typeof imageGallerySchema>;
export type ImageGalleryList = z.infer<typeof imageGalleryListSchema>;
export type CreateImageGallery = z.infer<typeof createImageGallerySchema>;
export type UpdateImageGallery = z.infer<typeof updateImageGallerySchema>;
export type AddImageToGallery = z.infer<typeof addImageToGallerySchema>;
export type RemoveImageFromGallery = z.infer<typeof removeImageFromGallerySchema>;
export type UpdateGalleryImage = z.infer<typeof updateGalleryImageSchema>;

// ==================== 曲库类型 ====================

export type AlbumMusicItem = z.infer<typeof albumMusicItemSchema>;
export type MusicAlbum = z.infer<typeof musicAlbumSchema>;
export type MusicAlbumList = z.infer<typeof musicAlbumListSchema>;
export type CreateMusicAlbum = z.infer<typeof createMusicAlbumSchema>;
export type UpdateMusicAlbum = z.infer<typeof updateMusicAlbumSchema>;

// ==================== 视频集类型 ====================

export type CollectionVideoItem = z.infer<typeof collectionVideoItemSchema>;
export type VideoCollection = z.infer<typeof videoCollectionSchema>;
export type VideoCollectionList = z.infer<typeof videoCollectionListSchema>;
export type CreateVideoCollection = z.infer<typeof createVideoCollectionSchema>;
export type UpdateVideoCollection = z.infer<typeof updateVideoCollectionSchema>;

// ==================== 代码库类型 ====================

export type RepositoryCodeItem = z.infer<typeof repositoryCodeItemSchema>;
export type DemoImageItem = z.infer<typeof demoImageItemSchema>;
export type CodeRepository = z.infer<typeof codeRepositorySchema>;
export type CodeRepositoryList = z.infer<typeof codeRepositoryListSchema>;
export type CreateCodeRepository = z.infer<typeof createCodeRepositorySchema>;
export type UpdateCodeRepository = z.infer<typeof updateCodeRepositorySchema>;
export type AddDemoImage = z.infer<typeof addDemoImageSchema>;
export type RemoveDemoImage = z.infer<typeof removeDemoImageSchema>;
