import { db } from "@/db";
import { friend } from "@/db/schema/profile";
import { eq, desc } from "drizzle-orm";
import { FriendUpdateType, FriendType } from "@/server/types/profile-type";

/**
 * 获取友链列表
 */
export async function getFriendList(): Promise<FriendType[]> {
  try {
    // 先获取个人资料ID
    const profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      return [];
    }

    const result = await db
      .select()
      .from(friend)
      .where(eq(friend.profileId, profileData.id))
      .orderBy(friend.sortOrder, desc(friend.createdAt));
    
    return result;
  } catch (error) {
    console.error("获取友链列表失败:", error);
    throw new Error("获取友链列表失败");
  }
}

/**
 * 新增友链
 */
export async function createFriend(data: FriendUpdateType): Promise<FriendType> {
  try {
    // 先获取或创建个人资料
    let profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      throw new Error("请先完善个人基本信息");
    }

    const [newFriend] = await db
      .insert(friend)
      .values({
        profileId: profileData.id,
        name: data.name,
        title: data.title,
        url: data.url,
        avatar: data.avatar,
        avatarMimeType: data.avatarMimeType,
        sortOrder: data.sortOrder || 0,
      })
      .returning();

    if (!newFriend) {
      throw new Error("创建友链失败");
    }

    return newFriend;
  } catch (error) {
    console.error("创建友链失败:", error);
    throw new Error("创建友链失败");
  }
}

/**
 * 删除友链
 */
export async function deleteFriend(id: string): Promise<{ deleted: boolean; id: string }> {
  try {
    const [deletedFriend] = await db
      .delete(friend)
      .where(eq(friend.id, id))
      .returning({ id: friend.id });

    if (!deletedFriend) {
      throw new Error("删除友链失败");
    }

    return {
      deleted: true,
      id: deletedFriend.id,
    };
  } catch (error) {
    console.error("删除友链失败:", error);
    throw new Error("删除友链失败");
  }
}

/**
 * 根据ID获取单个友链
 */
export async function getFriendById(id: string): Promise<FriendType | null> {
  try {
    const result = await db
      .select()
      .from(friend)
      .where(eq(friend.id, id))
      .limit(1);
    
    return result[0] || null;
  } catch (error) {
    console.error("获取友链失败:", error);
    throw new Error("获取友链失败");
  }
}
