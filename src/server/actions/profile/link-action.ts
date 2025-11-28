import { db } from "@/db";
import { socialLink } from "@/db/schema/profile";
import { eq, desc } from "drizzle-orm";
import { SocialLinkUpdateType, SocialLinkType } from "@/server/types/profile-type";

/**
 * 获取社交链接列表
 */
export async function getSocialLinkList(): Promise<SocialLinkType[]> {
  try {
    // 先获取个人资料ID
    const profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      return [];
    }

    const result = await db.query.socialLink.findMany({
      where: eq(socialLink.profileId, profileData.id),
      orderBy: [socialLink.sortOrder, desc(socialLink.createdAt)],
    });
    
    return result;
  } catch (error) {
    console.error("获取社交链接失败:", error);
    throw new Error("获取社交链接失败");
  }
}

/**
 * 新增社交链接
 */
export async function createSocialLink(data: SocialLinkUpdateType): Promise<SocialLinkType> {
  try {
    // 先获取或创建个人资料
    let profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      throw new Error("请先完善个人基本信息");
    }

    const [newSocialLink] = await db
      .insert(socialLink)
      .values({
        profileId: profileData.id,
        platform: data.platform,
        url: data.url,
        icon: data.icon,
        sortOrder: data.sortOrder || 0,
      })
      .returning();

    if (!newSocialLink) {
      throw new Error("创建社交链接失败");
    }

    return newSocialLink;
  } catch (error) {
    console.error("创建社交链接失败:", error);
    throw new Error("创建社交链接失败");
  }
}

/**
 * 更新社交链接
 */
export async function updateSocialLink(id: string, data: SocialLinkUpdateType): Promise<SocialLinkType> {
  try {
    const [updatedSocialLink] = await db
      .update(socialLink)
      .set({
        platform: data.platform,
        url: data.url,
        icon: data.icon,
        sortOrder: data.sortOrder || 0,
        updatedAt: new Date(),
      })
      .where(eq(socialLink.id, id))
      .returning();

    if (!updatedSocialLink) {
      throw new Error("更新社交链接失败");
    }

    return updatedSocialLink;
  } catch (error) {
    console.error("更新社交链接失败:", error);
    throw new Error("更新社交链接失败");
  }
}

/**
 * 删除社交链接
 */
export async function deleteSocialLink(id: string): Promise<{ deleted: boolean; id: string }> {
  try {
    const [deletedSocialLink] = await db
      .delete(socialLink)
      .where(eq(socialLink.id, id))
      .returning({ id: socialLink.id });

    if (!deletedSocialLink) {
      throw new Error("删除社交链接失败");
    }

    return {
      deleted: true,
      id: deletedSocialLink.id,
    };
  } catch (error) {
    console.error("删除社交链接失败:", error);
    throw new Error("删除社交链接失败");
  }
}

/**
 * 根据ID获取单个社交链接
 */
export async function getSocialLinkById(id: string): Promise<SocialLinkType | null> {
  try {
    const result = await db.query.socialLink.findFirst({
      where: eq(socialLink.id, id),
    });
    
    return result || null;
  } catch (error) {
    console.error("获取社交链接失败:", error);
    throw new Error("获取社交链接失败");
  }
}
