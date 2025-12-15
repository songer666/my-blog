import { z } from "zod";
import {
  // 图库
  galleryImageItemSchema,
  imageGallerySchema,
  imageGalleryListSchema,
  // 曲库
  albumMusicItemSchema,
  musicAlbumSchema,
  musicAlbumListSchema,
  // 视频集
  collectionVideoItemSchema,
  videoCollectionSchema,
  // 代码库
  repositoryCodeItemSchema,
  demoImageItemSchema,
  codeRepositorySchema,
  codeRepositoryListItemSchema,
} from "@/server/schema/resources-schema";

// ==================== 图库类型 ====================

export type GalleryImageItem = z.infer<typeof galleryImageItemSchema>;
export type ImageGallery = z.infer<typeof imageGallerySchema>;
export type ImageGalleryList = z.infer<typeof imageGalleryListSchema>;

// ==================== 曲库类型 ====================

export type AlbumMusicItem = z.infer<typeof albumMusicItemSchema>;
export type MusicAlbum = z.infer<typeof musicAlbumSchema>;
export type MusicAlbumList = z.infer<typeof musicAlbumListSchema>;

// ==================== 视频集类型 ====================

export type CollectionVideoItem = z.infer<typeof collectionVideoItemSchema>;
export type VideoCollection = z.infer<typeof videoCollectionSchema>;

// ==================== 代码库类型 ====================

export type RepositoryCodeItem = z.infer<typeof repositoryCodeItemSchema>;
export type DemoImageItem = z.infer<typeof demoImageItemSchema>;
export type CodeRepository = z.infer<typeof codeRepositorySchema>;
export type CodeRepositoryListItem = z.infer<typeof codeRepositoryListItemSchema>;
