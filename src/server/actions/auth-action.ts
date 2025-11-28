import {auth} from "@/lib/auth";
import {db} from "@/db";
import {user as userTable, account as accountTable, session as sessionTable} from '@/db/schema'
import {eq} from "drizzle-orm";
import {isNil} from 'lodash';
import {headers} from "next/headers";
/**
 * 获取当前会话信息
 * */
export const getSession = async () =>{
    return await auth.api.getSession({headers: await headers()});
}

/**
 * 获取用户列表
 * */
export const getUserList =  async () => {
    const users = await db.query.user.findMany({
        with: {sessions: true},
        orderBy: (user, { asc }) => [asc(user.createdAt)]
    });
    return users;
}

/**
 * 删除用户
 * */
export async function deleteUser(id: string) {
    const res = await db.transaction(async (tx) => {
        const user = await tx
            .select()
            .from(userTable)
            .where(eq(userTable.id, id));

        if (!user) return { deleted: false, reason: "NOT_FOUND" };

        // 2) 先删会话、账号关联，再删用户
        const delSessions = await tx
            .delete(sessionTable)
            .where(eq(sessionTable.userId, id))
            .returning({ id: sessionTable.id });

        const delAccounts = await tx
            .delete(accountTable)
            .where(eq(accountTable.userId, id))
            .returning({ id: accountTable.id });

        const [delUser] = await tx
            .delete(userTable)
            .where(eq(userTable.id, id))
            .returning({ id: userTable.id });

        return {
            deleted: true,
            userId: delUser?.id ?? id,
            sessions: delSessions.length,
            accounts: delAccounts.length,
        };
    });

    return res;
}

/**
 * 切换用户的邮箱验证状态，否则不能登录了
 * @id: string
 * */
export async function toggleVerify(id: string, emailVerified: boolean) {
    await db
        .delete(sessionTable)
        .where(eq(sessionTable.userId, id));
    const [user] = await db
        .update(userTable)
        .set({emailVerified})
        .where(eq(userTable.id, id))
        .returning();
    if (isNil(user)) return null;
    return user;
}

/**
 * 更新用户信息（只能修改名字和邮箱）
 * @param id 用户ID
 * @param name 用户名
 * @param email 邮箱
 */
export async function updateUser(id: string, name: string, email: string) {
    const [user] = await db
        .update(userTable)
        .set({
            name,
            email,
            updatedAt: new Date(),
        })
        .where(eq(userTable.id, id))
        .returning();
    
    if (isNil(user)) return null;
    return user;
}

/**
 * 更新用户头像
 * @param id 用户ID
 * @param image 头像数据（base64）
 */
export async function updateUserAvatar(id: string, image: string) {
    const [user] = await db
        .update(userTable)
        .set({
            image,
            updatedAt: new Date(),
        })
        .where(eq(userTable.id, id))
        .returning();
    
    if (isNil(user)) return null;
    return user;
}


