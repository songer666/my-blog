import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { 
  profile, 
  socialLink, 
  education, 
  skillCategory, 
  skill,
  friend
} from "@/db/schema/profile";

// Profile Schemas
export const profileSchema = createSelectSchema(profile);

// Bio 专用 Schema
export const bioUpdateSchema = z.object({
  name: z.string().min(1, "姓名不能为空").max(50, "姓名不能超过50个字符"),
  title: z.string().min(1, "职位不能为空").max(100, "职位不能超过100个字符"),
  email: z.string().email("邮箱格式不正确"),
  bio: z.string().min(1, "个人简介不能为空").max(1000, "个人简介不能超过1000个字符"),
  avatar: z.string().optional(),
  avatarMimeType: z.string().optional(),
});

// Social Link Schemas
export const socialLinkSchema = createSelectSchema(socialLink);

// Social Link 专用 Schema
export const socialLinkUpdateSchema = z.object({
  platform: z.string().min(1, "平台名称不能为空").max(50, "平台名称不能超过50个字符"),
  url: z.string().url("URL格式不正确"),
  icon: z.string().min(1, "图标不能为空").max(10, "图标不能超过10个字符"),
  sortOrder: z.number().int().min(0).default(0),
});

// Education Schemas
export const educationSchema = createSelectSchema(education);

// Skill Category Schemas
export const skillCategorySchema = createSelectSchema(skillCategory);

// Skill Category 专用 Schema
export const skillCategoryUpdateSchema = z.object({
  name: z.string().min(1, "分类名称不能为空").max(50, "分类名称不能超过50个字符"),
  sortOrder: z.number().int().min(0).default(0),
});

// Skill Schemas
export const skillSchema = createSelectSchema(skill);
export const insertSkillSchema = createInsertSchema(skill, {
  name: z.string().min(1, "技能名称不能为空").max(50, "技能名称不能超过50个字符"),
  icon: z.string().optional(),
  iconMimeType: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// Skill 专用 Schema
export const skillUpdateSchema = z.object({
  categoryId: z.string().min(1, "分类ID不能为空"),
  name: z.string().min(1, "技能名称不能为空").max(50, "技能名称不能超过50个字符"),
  icon: z.string().optional(),
  iconMimeType: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// 复合查询 Schema（用于完整的个人资料查询）
export const fullProfileSchema = profileSchema.extend({
  socialLinks: z.array(socialLinkSchema).optional(),
  education: z.array(educationSchema).optional(),
  skillCategories: z.array(
    skillCategorySchema.extend({
      skills: z.array(skillSchema).optional(),
    })
  ).optional(),
});

// 响应 Schema
export const profileResponseSchema = z.object({
  success: z.boolean(),
  data: profileSchema.optional(),
  message: z.string().optional(),
});

export const bioResponseSchema = z.object({
  success: z.boolean(),
  data: profileSchema.optional(),
  message: z.string().optional(),
});

// Education 专用 Schema
export const educationUpdateSchema = z.object({
  school: z.string().min(1, "学校名称不能为空").max(100, "学校名称不能超过100个字符"),
  college: z.string().min(1, "学院名称不能为空").max(100, "学院名称不能超过100个字符"),
  degree: z.string().min(1, "学位不能为空").max(50, "学位不能超过50个字符"),
  major: z.string().min(1, "专业不能为空").max(100, "专业不能超过100个字符"),
  schoolUrl: z.string().url("学校链接格式不正确").optional().or(z.literal("")),
  startYear: z.number().int().min(1900, "开始年份不能早于1900年").max(new Date().getFullYear() + 10),
  endYear: z.number().int().min(1900, "结束年份不能早于1900年").max(new Date().getFullYear() + 10),
  logo: z.string().optional(),
  logoMimeType: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const educationListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(educationSchema).optional(),
  message: z.string().optional(),
});

// Social Link 响应 Schema
export const socialLinkResponseSchema = z.object({
  success: z.boolean(),
  data: socialLinkSchema.optional(),
  message: z.string().optional(),
});

export const socialLinkListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(socialLinkSchema).optional(),
  message: z.string().optional(),
});

// Skill 响应 Schema
export const skillCategoryResponseSchema = z.object({
  success: z.boolean(),
  data: skillCategorySchema.optional(),
  message: z.string().optional(),
});

export const skillCategoryListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(skillCategorySchema.extend({
    skills: z.array(skillSchema).optional(),
  })).optional(),
  message: z.string().optional(),
});

export const skillResponseSchema = z.object({
  success: z.boolean(),
  data: skillSchema.optional(),
  message: z.string().optional(),
});

// Friend Schemas
export const friendSchema = createSelectSchema(friend);
export const insertFriendSchema = createInsertSchema(friend, {
  name: z.string().min(1, "友链名称不能为空").max(50, "友链名称不能超过50个字符"),
  title: z.string().min(1, "友链标题不能为空").max(100, "友链标题不能超过100个字符"),
  url: z.string().url("友链地址格式不正确"),
  avatar: z.string().optional(),
  avatarMimeType: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// Friend 专用 Schema
export const friendUpdateSchema = z.object({
  name: z.string().min(1, "友链名称不能为空").max(50, "友链名称不能超过50个字符"),
  title: z.string().min(1, "友链标题不能为空").max(100, "友链标题不能超过100个字符"),
  url: z.string().url("友链地址格式不正确"),
  avatar: z.string().optional(),
  avatarMimeType: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
});

// Friend 响应 Schema
export const friendResponseSchema = z.object({
  success: z.boolean(),
  data: friendSchema.optional(),
  message: z.string().optional(),
});

export const friendListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(friendSchema).optional(),
  message: z.string().optional(),
});