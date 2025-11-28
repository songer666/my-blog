import { db } from "@/db";
import { profile } from "@/db/schema/profile";
import { eq } from "drizzle-orm";
import { BioUpdateType, ProfileType } from "@/server/types/profile-type";

/**
 * 获取个人资料基本信息
 */
export async function getProfile(): Promise<ProfileType | null> {
  try {
    const result = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });
    
    return result || null;
  } catch (error) {
    console.error("获取个人资料失败:", error);
    throw new Error("获取个人资料失败");
  }
}

/**
 * 更新个人基本信息
 */
export async function updateBio(data: BioUpdateType): Promise<ProfileType> {
  try {
    // 先检查是否已存在个人资料
    const existingProfile = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    let result: ProfileType;

    if (existingProfile) {
      // 更新现有资料
      const [updatedProfile] = await db
        .update(profile)
        .set({
          name: data.name,
          title: data.title,
          email: data.email,
          bio: data.bio,
          avatar: data.avatar,
          avatarMimeType: data.avatarMimeType,
          updatedAt: new Date(),
        })
        .where(eq(profile.id, existingProfile.id))
        .returning();

      if (!updatedProfile) {
        throw new Error("更新个人资料失败");
      }

      result = updatedProfile;
    } else {
      // 创建新的个人资料
      const [newProfile] = await db
        .insert(profile)
        .values({
          name: data.name,
          title: data.title,
          email: data.email,
          bio: data.bio,
          avatar: data.avatar,
          avatarMimeType: data.avatarMimeType,
        })
        .returning();

      if (!newProfile) {
        throw new Error("创建个人资料失败");
      }

      result = newProfile;
    }

    return result;
  } catch (error) {
    console.error("更新个人资料失败:", error);
    throw new Error("更新个人资料失败");
  }
}

/**
 * 获取完整的个人资料信息（包含关联数据）
 */
export async function getFullProfile() {
  try {
    const result = await db.query.profile.findFirst({
      with: {
        socialLinks: {
          orderBy: (socialLinks, { asc }) => [asc(socialLinks.sortOrder)],
        },
        education: {
          orderBy: (education, { desc }) => [desc(education.startYear)],
        },
        skillCategories: {
          with: {
            skills: {
              orderBy: (skills, { asc }) => [asc(skills.sortOrder)],
            },
          },
          orderBy: (skillCategories, { asc }) => [asc(skillCategories.sortOrder)],
        },
      },
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    return result || null;
  } catch (error) {
    console.error("获取完整个人资料失败:", error);
    throw new Error("获取完整个人资料失败");
  }
}

/**
 * 获取公开的完整个人资料信息（包含关联数据，包括友链）
 */
export async function getPublicFullProfile() {
  try {
    const result = await db.query.profile.findFirst({
      with: {
        socialLinks: {
          orderBy: (socialLinks, { asc }) => [asc(socialLinks.sortOrder)],
        },
        education: {
          orderBy: (education, { desc }) => [desc(education.startYear)],
        },
        skillCategories: {
          with: {
            skills: {
              orderBy: (skills, { asc }) => [asc(skills.sortOrder)],
            },
          },
          orderBy: (skillCategories, { asc }) => [asc(skillCategories.sortOrder)],
        },
        friends: {
          orderBy: (friends, { asc }) => [asc(friends.sortOrder)],
        },
      },
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    return result || null;
  } catch (error) {
    console.error("获取公开完整个人资料失败:", error);
    throw new Error("获取公开完整个人资料失败");
  }
}