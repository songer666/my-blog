import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { project } from "@/db/schema/project";

// Project Schemas
export const projectSchema = createSelectSchema(project);
export const insertProjectSchema = createInsertSchema(project, {
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

// Project 专用 Schema
export const projectUpdateSchema = z.object({
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
  githubUrl: z.string().url("GitHub链接格式不正确").optional().or(z.literal('')),
  demoUrl: z.string().url("演示链接格式不正确").optional().or(z.literal('')),
  keyWords: z.string().optional(),
  visible: z.boolean().default(false),
  codeRepositoryId: z.string().nullable().optional(), // 关联的代码库ID
  createdAt: z.union([z.date(), z.string().transform((val) => new Date(val))]).optional(), // 创建时间（可选）
});

// Project 创建 Schema
export const projectCreateSchema = projectUpdateSchema;

// Project 响应 Schema
export const projectResponseSchema = z.object({
  success: z.boolean(),
  data: projectSchema.optional(),
  message: z.string().optional(),
});

export const projectListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(projectSchema).optional(),
  message: z.string().optional(),
});

