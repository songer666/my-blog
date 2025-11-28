import {createAuthClient} from "better-auth/react";

// Better Auth 官方客户端
export const authClient = createAuthClient({
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: '/api/auth',
})