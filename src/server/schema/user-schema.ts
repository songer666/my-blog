import {z} from "zod";

// 用户登录请求 schema
export const loginRequestSchema = z.object({
    email: z.string().min(8, '请输入用户名或邮箱'),
    password: z.string().min(8, '密码至少8位'),
});

//用户信息schema
export const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    emailVerified: z.boolean(),
    image: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date().nullable(),
})

// 会话信息 schema
export const sessionSchema = z.object({
    id: z.string(),
    userId: z.string(),
    expiresAt: z.date().meta({ description: 'session过期时间' }),
    token: z.string(),
    ipAddress: z.string().nullable(),
    userAgent: z.string().nullable(),
});

//用户注册
export const registerUserSchema = z.object({
    email: z.email(),
    name: z.string().min(2, '用户名至少2位'),
    password: z.string().min(8, '密码至少8位'),
})

//用户更新（只能修改名字和邮箱）
export const updateUserSchema = z.object({
    id: z.string().min(1, 'ID不能为空'),
    email: z.string().email('请输入有效的邮箱地址'),
    name: z.string().min(2, '用户名至少2位'),
})

//用户头像更新
export const updateUserAvatarSchema = z.object({
    id: z.string().min(1, 'ID不能为空'),
    image: z.string().min(1, '头像不能为空'),
})

//用户列表
export const userListSchema = z.array(
    userSchema.extend({
        sessions: z.array(sessionSchema).default([])
    })
);