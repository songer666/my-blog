import {betterAuth} from "better-auth";
import {drizzleAdapter} from "better-auth/adapters/drizzle";
import {db} from "@/db";
import {nextCookies} from "better-auth/next-js";
import {openAPI} from "better-auth/plugins";
import * as schema from "@/db/schema";
import {cookies} from "next/headers";

/**
 * 创建better-auth实例
 * nextCookies插件可以访问cookies
 *
 * */
export const auth = betterAuth({
    database: drizzleAdapter(db,{
        provider: 'pg',
        schema
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async (data) => {
            const cookieStore = await cookies();
            cookieStore.set('token',data.token,{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 2
            });
            return Promise.resolve();
        }
    },
    session: {
        cookieCache: {
            enabled: false, // 禁用 cookie cache，避免超出大小限制
        },
    },
    advanced: {
        cookiePrefix: "better-auth",
        // 开发环境禁用 secure cookies
        useSecureCookies: process.env.NODE_ENV === 'production',
        // useSecureCookies: false,
        crossSubDomainCookies: {
            enabled: false,
        },
    },
    plugins: [
        // cookies插件
        nextCookies(),
        // openapi插件
        openAPI({
            path: '/reference',
            disableDefaultReference: false,
        }),
    ]
})

export interface AuthType {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
}
