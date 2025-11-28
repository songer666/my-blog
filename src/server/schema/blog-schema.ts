import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { tag, post, postTags } from "@/db/schema/blog";

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
  image: z.string().optional().refine((val) => {
    if (!val) return true; // 可选字段
    // 检查是否是base64图片格式
    if (!val.startsWith('data:image/') || !val.includes('base64,')) {
      return false;
    }
    // 检查base64大小（估算字节数）
    const sizeInBytes = Math.round((val.length * 3) / 4);
    return sizeInBytes <= 700 * 1024; // 700KB限制，给一些缓冲
  }, "图片格式不正确或文件过大，请上传小于500KB的有效图片文件"),
  keyWords: z.string().optional(),
});

// Post 专用 Schema
export const postUpdateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过200个字符"),
  description: z.string().min(1, "描述不能为空").max(500, "描述不能超过500个字符"),
  slug: z.string().min(1, "URL别名不能为空").max(100, "URL别名不能超过100个字符"),
  content: z.string().min(1, "内容不能为空"),
  image: z.string().optional().refine((val) => {
    if (!val) return true; // 可选字段
    // 检查是否是base64图片格式
    if (!val.startsWith('data:image/') || !val.includes('base64,')) {
      return false;
    }
    // 检查base64大小（估算字节数）
    const sizeInBytes = Math.round((val.length * 3) / 4);
    return sizeInBytes <= 900 * 1024; // 900KB限制，给一些缓冲
  }, "图片格式不正确或文件过大，请上传小于800KB的有效图片文件"),
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
