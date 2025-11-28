import {createTRPCRouter, protectedProcedure} from "@/server/init";
import {userListSchema, updateUserSchema, updateUserAvatarSchema} from "@/server/schema/user-schema";
import {deleteUser, getUserList, toggleVerify, updateUser, updateUserAvatar} from "@/server/actions/auth-action";
import {isNil} from "lodash";
import {TRPCError} from "@trpc/server";
import {z} from "zod";
import {revalidatePath} from "next/cache";

const isrUrl = '/admin/dashboard/user';

export const authRoute = createTRPCRouter({
    all: protectedProcedure
        .output(userListSchema)
        .query(async () => {
            try {
                const users = await getUserList();
                if (isNil(users) || users.length === 0)
                    return [];
                return users;
            } catch (e: any) {
                throw new TRPCError({code: 'UNAUTHORIZED', message: e});
            }
        }),
    session: protectedProcedure
        .query(async (opts) => {
            try {
                if (isNil(opts.ctx.session))
                    throw new TRPCError({code: 'UNAUTHORIZED', message: '未登录'});
                return opts.ctx.session;
            } catch (e: any) {
                throw new TRPCError({code: 'UNAUTHORIZED', message: e});
            }
        }),
    delete: protectedProcedure
        .input(z.object({id: z.string()}))
        .mutation(async (opts) => {
            try {
                const res = await deleteUser(opts.input.id);
                if (isNil(res) || !res.deleted){
                    throw new TRPCError({code: 'UNAUTHORIZED', message: JSON.stringify(res)});
                }
                revalidatePath(isrUrl)
                return res;
            } catch (e: any) {
                throw new TRPCError({code: 'UNAUTHORIZED', message: e});
            }
        }),
    toggle: protectedProcedure
        .input(z.object({id: z.string(),emailVerified: z.boolean()}))
        .mutation(async (opts) => {
            try {
                const res = await toggleVerify(opts.input.id,opts.input.emailVerified);
                if (isNil(res))
                    throw new TRPCError({code: 'UNAUTHORIZED', message: '切换失败'});
                revalidatePath(isrUrl)
                return res;
            } catch (e: any) {
                throw new TRPCError({code: 'UNAUTHORIZED', message: e.message});
            }
        }),
    update: protectedProcedure
        .input(updateUserSchema)
        .mutation(async (opts) => {
            try {
                const { id, name, email } = opts.input;
                const res = await updateUser(id, name, email);
                if (isNil(res))
                    throw new TRPCError({code: 'NOT_FOUND', message: '用户不存在'});
                revalidatePath(isrUrl);
                return res;
            } catch (e: any) {
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: e.message || '更新失败'});
            }
        }),
    updateAvatar: protectedProcedure
        .input(updateUserAvatarSchema)
        .mutation(async (opts) => {
            try {
                const { id, image } = opts.input;
                const res = await updateUserAvatar(id, image);
                if (isNil(res))
                    throw new TRPCError({code: 'NOT_FOUND', message: '用户不存在'});
                revalidatePath(isrUrl);
                return res;
            } catch (e: any) {
                throw new TRPCError({code: 'INTERNAL_SERVER_ERROR', message: e.message || '头像更新失败'});
            }
        })
})