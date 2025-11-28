import { db } from "@/db";
import { education, profile } from "@/db/schema/profile";
import { eq, desc } from "drizzle-orm";
import { EducationUpdateType, EducationType } from "@/server/types/profile-type";

/**
 * 获取教育经历列表
 */
export async function getEducationList(): Promise<EducationType[]> {
  try {
    // 先获取个人资料ID
    const profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      return [];
    }

    const result = await db.query.education.findMany({
      where: eq(education.profileId, profileData.id),
      orderBy: [desc(education.startYear), education.sortOrder],
    });
    
    return result;
  } catch (error) {
    console.error("获取教育经历失败:", error);
    throw new Error("获取教育经历失败");
  }
}

/**
 * 新增教育经历
 */
export async function createEducation(data: EducationUpdateType): Promise<EducationType> {
  try {
    // 先获取或创建个人资料
    let profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      throw new Error("请先完善个人基本信息");
    }

    const [newEducation] = await db
      .insert(education)
      .values({
        profileId: profileData.id,
        school: data.school,
        college: data.college,
        degree: data.degree,
        major: data.major,
        schoolUrl: data.schoolUrl || null,
        startYear: data.startYear,
        endYear: data.endYear,
        logo: data.logo,
        logoMimeType: data.logoMimeType,
        sortOrder: data.sortOrder || 0,
      })
      .returning();

    if (!newEducation) {
      throw new Error("创建教育经历失败");
    }

    return newEducation;
  } catch (error) {
    console.error("创建教育经历失败:", error);
    throw new Error("创建教育经历失败");
  }
}

/**
 * 删除教育经历
 */
export async function deleteEducation(id: string): Promise<{ deleted: boolean; id: string }> {
  try {
    const [deletedEducation] = await db
      .delete(education)
      .where(eq(education.id, id))
      .returning({ id: education.id });

    if (!deletedEducation) {
      throw new Error("删除教育经历失败");
    }

    return {
      deleted: true,
      id: deletedEducation.id,
    };
  } catch (error) {
    console.error("删除教育经历失败:", error);
    throw new Error("删除教育经历失败");
  }
}
