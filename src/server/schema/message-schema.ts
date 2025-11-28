import { z } from "zod";

// 消息信息 schema
export const messageSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  content: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 创建消息 schema
export const createMessageSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  content: z.string().min(10, '留言内容至少需要10个字符'),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// 消息列表 schema
export const messageListSchema = z.array(messageSchema);
