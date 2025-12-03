import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tag, post, postTags, postView } from "@/db/schema/blog";

// Tag Schemas
export const tagSchema = createSelectSchema(tag);
export const insertTagSchema = createInsertSchema(tag, {
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符"),
});

// Tag 专用 Schema
export const tagUpdateSchema = z.object({
  name: z.string().min(1, "标签名称不能为空").max(50, "标签名称不能超过50个字符"),
});

// Tag 响应 Schema
export const tagResponseSchema = z.object({
  success: z.boolean(),
  data: tagSchema.optional(),
  message: z.string().optional(),
});

export const tagListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(tagSchema).optional(),
  message: z.string().optional(),
});

// Post Schemas
export const postSchema = createSelectSchema(post);
export const insertPostSchema = createInsertSchema(post, {
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过200个字符"),
  description: z.string().min(1, "描述不能为空").max(500, "描述不能超过500个字符"),
  slug: z.string().min(1, "URL别名不能为空").max(100, "URL别名不能超过100个字符"),
  content: z.string().min(1, "内容不能为空"),
  image: z.string().url("请输入有效的图片URL").optional().or(z.literal('')),
  keyWords: z.string().optional(),
});

// Post 专用 Schema
export const postUpdateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过200个字符"),
  description: z.string().min(1, "描述不能为空").max(500, "描述不能超过500个字符"),
  slug: z.string().min(1, "URL别名不能为空").max(100, "URL别名不能超过100个字符"),
  content: z.string().min(1, "内容不能为空"),
  image: z.string().url("请输入有效的图片URL").optional().or(z.literal('')),
  keyWords: z.string().optional(),
  visible: z.boolean().default(false),
  tagIds: z.array(z.string()).optional(), // 标签ID数组
  relatedCodeRepositoryId: z.string().nullable().optional(), // 关联的代码库ID
  createdAt: z.union([z.date(), z.string().transform((val) => new Date(val))]).optional(), // 创建时间（可选）
});

// Post 创建 Schema
export const postCreateSchema = postUpdateSchema;

// Post 响应 Schema
export const postResponseSchema = z.object({
  success: z.boolean(),
  data: postSchema.optional(),
  message: z.string().optional(),
});

export const postListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(postSchema.extend({
    tags: z.array(tagSchema).optional(), // 包含关联的标签
    relatedCodeRepository: z.object({
      id: z.string(),
      title: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
    }).optional(), // 包含关联的代码库
  })).optional(),
  message: z.string().optional(),
});

// PostTags Schemas
export const postTagsSchema = createSelectSchema(postTags);
export const insertPostTagsSchema = createInsertSchema(postTags);

// PostView Schemas (访问统计)
export const postViewSchema = createSelectSchema(postView);
export const insertPostViewSchema = createInsertSchema(postView, {
  postId: z.string().min(1, "文章ID不能为空"),
  ip: z.string().min(1, "IP不能为空"),
  userAgent: z.string().optional(),
});

// 获取统计的响应 Schema
export const postStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    postId: z.string(),
    viewCount: z.number(),
  }).optional(),
  message: z.string().optional(),
});

// 批量获取统计的响应 Schema
export const postStatsBatchResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    postId: z.string(),
    viewCount: z.number(),
  })).optional(),
  message: z.string().optional(),
});
