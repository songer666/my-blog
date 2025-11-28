import {createAuthClient} from "better-auth/react";

// Better Auth 官方客户端
export const authClient = createAuthClient({
    baseURL: `https://${process.env.VERCEL_URL}`,
    basePath: '/api/auth',
})