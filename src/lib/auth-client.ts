import {createAuthClient} from "better-auth/react";

// Better Auth 官方客户端
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_NETWORK_URL || 'http://localhost:3000',
    basePath: '/api/auth',
})