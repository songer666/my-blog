import { pgTable, text, timestamp, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";

/**
 * 图库表
 * 存储图库信息，图片以 JSON 数组形式存储在 items 字段中
 */
export const imageGallery = pgTable("image_gallery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // 基本信息
  title: varchar("title", { length: 255 }).notNull(), // 图库标题
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug
  description: text("description"), // 图库描述
  keywords: text("keywords").array(), // 关键词数组
  tags: text("tags").array(), // 标签数组
  
  // 图片数据（JSON 存储）
  // items: Array<{
  //   id: string;
  //   name: string;
  //   r2Key: string;
  //   fileSize: number;
  //   mimeType: string;
  //   width: number;
  //   height: number;
  //   alt?: string;
  //   uploadedAt: string;
  // }>
  items: jsonb("items").$type<Array<{
    id: string;
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    alt?: string;
    uploadedAt: string;
  }>>().default([]).notNull(),
  
  // 统计信息
  itemCount: integer("item_count").default(0).notNull(), // 图片数量
  totalSize: integer("total_size").default(0).notNull(), // 总大小（字节）
  
  // 通用字段
  isPublic: boolean("is_public").default(true).notNull(), // 是否公开
  sort: integer("sort").default(0).notNull(), // 排序
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 曲库表
 * 存储曲库信息，音乐以 JSON 数组形式存储在 items 字段中
 */
export const musicAlbum = pgTable("music_album", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // 基本信息
  title: varchar("title", { length: 255 }).notNull(), // 曲库标题
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug
  description: text("description"), // 曲库描述
  coverImage: text("cover_image"), // 首页图（base64 格式）
  keywords: text("keywords").array(), // 关键词数组
  tags: text("tags").array(), // 标签数组
  
  // 音乐数据（JSON 存储）
  // items: Array<{
  //   id: string;
  //   name: string;
  //   r2Key: string;
  //   fileSize: number;
  //   mimeType: string;
  //   artist?: string;
  //   duration?: number;
  //   bitrate?: number;
  //   coverKey?: string;
  //   uploadedAt: string;
  // }>
  items: jsonb("items").$type<Array<{
    id: string;
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    artist?: string;
    duration?: number;
    bitrate?: number;
    coverKey?: string;
    uploadedAt: string;
  }>>().default([]).notNull(),
  
  // 统计信息
  itemCount: integer("item_count").default(0).notNull(), // 音乐数量
  totalSize: integer("total_size").default(0).notNull(), // 总大小（字节）
  
  // 通用字段
  isPublic: boolean("is_public").default(true).notNull(), // 是否公开
  sort: integer("sort").default(0).notNull(), // 排序
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 视频集表
 * 存储视频集信息，视频以 JSON 数组形式存储在 items 字段中
 */
export const videoCollection = pgTable("video_collection", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // 基本信息
  title: varchar("title", { length: 255 }).notNull(), // 视频集标题
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug
  description: text("description"), // 视频集描述
  coverImage: text("cover_image"), // 首页图（base64 格式）
  keywords: text("keywords").array(), // 关键词数组
  tags: text("tags").array(), // 标签数组
  
  // 视频数据（JSON 存储）
  // items: Array<{
  //   id: string;
  //   name: string;
  //   r2Key: string;
  //   fileSize: number;
  //   mimeType: string;
  //   duration?: number;
  //   width?: number;
  //   height?: number;
  //   coverKey?: string;
  //   uploadedAt: string;
  // }>
  items: jsonb("items").$type<Array<{
    id: string;
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    duration?: number;
    width?: number;
    height?: number;
    coverKey?: string;
    uploadedAt: string;
  }>>().default([]).notNull(),
  
  // 统计信息
  itemCount: integer("item_count").default(0).notNull(), // 视频数量
  totalSize: integer("total_size").default(0).notNull(), // 总大小（字节）
  
  // 通用字段
  isPublic: boolean("is_public").default(true).notNull(), // 是否公开
  sort: integer("sort").default(0).notNull(), // 排序
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 代码库表
 * 存储代码库信息，代码文件以树形结构 JSON 存储在 items 字段中
 */
export const codeRepository = pgTable("code_repository", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  // 基本信息
  title: varchar("title", { length: 255 }).notNull(), // 代码库标题
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL slug
  description: text("description"), // 代码库描述
  keywords: text("keywords").array(), // 关键词数组
  tags: text("tags").array(), // 标签数组
  
  // 代码文件数据（树形结构 JSON 存储）
  // items: Array<{
  //   id: string;
  //   name: string;
  //   path: string; // 文件路径，如：src/components/Button.tsx
  //   content?: string; // 代码内容（新版本直接存储在数据库）
  //   r2Key?: string; // R2 存储密钥（兼容旧数据）
  //   fileSize: number;
  //   language?: string;
  //   uploadedAt: string;
  // }>
  items: jsonb("items").$type<Array<{
    id: string;
    name: string;
    path: string;
    content?: string; // 代码内容直接存储在数据库（新）
    r2Key?: string; // 兼容旧数据
    fileSize: number;
    language?: string;
    uploadedAt: string;
  }>>().default([]).notNull(),
  
  // 演示图片数据（JSON 存储）
  // demoImages: Array<{
  //   id: string;
  //   name: string;
  //   r2Key: string;
  //   fileSize: number;
  //   mimeType: string;
  //   width: number;
  //   height: number;
  //   alt?: string;
  //   uploadedAt: string;
  // }>
  demoImages: jsonb("demo_images").$type<Array<{
    id: string;
    name: string;
    r2Key: string;
    fileSize: number;
    mimeType: string;
    width: number;
    height: number;
    alt?: string;
    uploadedAt: string;
  }>>().default([]).notNull(),
  
  // 关联的文章ID（一对一，可选）
  relatedPostId: text("related_post_id"),
  
  // 统计信息
  itemCount: integer("item_count").default(0).notNull(), // 文件数量
  totalSize: integer("total_size").default(0).notNull(), // 总大小（字节）
  
  // 通用字段
  isPublic: boolean("is_public").default(true).notNull(), // 是否公开
  sort: integer("sort").default(0).notNull(), // 排序
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
