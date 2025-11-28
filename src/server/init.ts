import {initTRPC, TRPCError} from '@trpc/server';
import { cache } from 'react';
import superjson from "superjson";
import {getSession} from "@/server/actions/auth-action";
import {isNil} from "lodash";
import {ZodError} from "zod";
import {mapPgErrorToTrpc} from "@/server/error";

/**
 * trpc中间件
 */
export const createTRPCContext = cache(async () => {
    const session = await getSession();
    return {session};
});

export type CreateTRPCContextType = typeof createTRPCContext;

/**
 * 初始化trpc路由
 * */
const t = initTRPC.context<typeof createTRPCContext>().create({
    transformer: superjson,
    errorFormatter: ({shape, error}) => {
        const zodIssue = error.cause instanceof ZodError ? (error.cause as ZodError).issues : null;
        return {
            ...shape,
            data: {
                zodIssue,
            }
        }
    }
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

const pgErrorMiddleware = t.middleware(async ({ next }) => {
    try {
        return await next();
    } catch (err) {
        mapPgErrorToTrpc(err); // 映射为 TRPCError（不会返回）
    }
});

export const sqlProcedure = baseProcedure.use(pgErrorMiddleware);

export const protectedProcedure = baseProcedure
    .use(({ctx, next}) => {
        if (isNil(ctx.session?.user)) throw new TRPCError({code: 'UNAUTHORIZED', message: '未登录'});
            return next();
});
