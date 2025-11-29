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
  image: z.string().url("请输入有效的图片URL").optional().or(z.literal('')),
  keyWords: z.string().optional(),
});

// Project 专用 Schema
export const projectUpdateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200, "标题不能超过200个字符"),
  description: z.string().min(1, "描述不能为空").max(500, "描述不能超过500个字符"),
  slug: z.string().min(1, "URL别名不能为空").max(100, "URL别名不能超过100个字符"),
  content: z.string().min(1, "内容不能为空"),
  image: z.string().url("请输入有效的图片URL").optional().or(z.literal('')),
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

