import {z} from "zod";
import {
    userListSchema,
    userSchema
} from "@/server/schema/user-schema";

//用户类型
export type UserType = z.infer<typeof userSchema>;

//会话类型
export type UserList = z.infer<typeof userListSchema>;

// Better Auth 推断类型
// export type AuthUser = typeof import('../../lib/auth').auth.$Infer.Session.user;
// export type AuthSession = typeof import('../../lib/auth').auth.$Infer.Session.session;