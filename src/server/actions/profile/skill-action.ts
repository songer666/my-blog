import { db } from "@/db";
import { skillCategory, skill, profile } from "@/db/schema/profile";
import { eq, desc } from "drizzle-orm";
import { 
  SkillCategoryUpdateType, 
  SkillCategoryType, 
  SkillUpdateType, 
  SkillType 
} from "@/server/types/profile-type";

/**
 * 获取技能分类列表（包含技能）
 */
export async function getSkillCategoriesWithSkills(): Promise<(SkillCategoryType & { skills: SkillType[] })[]> {
  try {
    // 先获取个人资料ID
    const profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      return [];
    }

    // 先获取分类
    const categories = await db
      .select()
      .from(skillCategory)
      .where(eq(skillCategory.profileId, profileData.id))
      .orderBy(skillCategory.sortOrder, desc(skillCategory.createdAt));

    // 然后为每个分类获取技能
    const categoriesWithSkills = await Promise.all(
      categories.map(async (category) => {
        const skills = await db
          .select()
          .from(skill)
          .where(eq(skill.categoryId, category.id))
          .orderBy(skill.sortOrder, desc(skill.createdAt));
        
        return {
          ...category,
          skills,
        };
      })
    );
    
    return categoriesWithSkills;
  } catch (error) {
    console.error("获取技能分类失败:", error);
    throw new Error("获取技能分类失败");
  }
}

/**
 * 新增技能分类
 */
export async function createSkillCategory(data: SkillCategoryUpdateType): Promise<SkillCategoryType> {
  try {
    // 先获取或创建个人资料
    let profileData = await db.query.profile.findFirst({
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
    });

    if (!profileData) {
      throw new Error("请先完善个人基本信息");
    }

    const [newCategory] = await db
      .insert(skillCategory)
      .values({
        profileId: profileData.id,
        name: data.name,
        sortOrder: data.sortOrder || 0,
      })
      .returning();

    if (!newCategory) {
      throw new Error("创建技能分类失败");
    }

    return newCategory;
  } catch (error) {
    console.error("创建技能分类失败:", error);
    throw new Error("创建技能分类失败");
  }
}

/**
 * 删除技能分类（会级联删除该分类下的所有技能）
 */
export async function deleteSkillCategory(id: string): Promise<{ deleted: boolean; id: string }> {
  try {
    const [deletedCategory] = await db
      .delete(skillCategory)
      .where(eq(skillCategory.id, id))
      .returning({ id: skillCategory.id });

    if (!deletedCategory) {
      throw new Error("删除技能分类失败");
    }

    return {
      deleted: true,
      id: deletedCategory.id,
    };
  } catch (error) {
    console.error("删除技能分类失败:", error);
    throw new Error("删除技能分类失败");
  }
}

/**
 * 新增技能
 */
export async function createSkill(data: SkillUpdateType): Promise<SkillType> {
  try {
    const [newSkill] = await db
      .insert(skill)
      .values({
        categoryId: data.categoryId,
        name: data.name,
        icon: data.icon,
        iconMimeType: data.iconMimeType,
        sortOrder: data.sortOrder || 0,
      })
      .returning();

    if (!newSkill) {
      throw new Error("创建技能失败");
    }

    return newSkill;
  } catch (error) {
    console.error("创建技能失败:", error);
    throw new Error("创建技能失败");
  }
}

/**
 * 删除技能
 */
export async function deleteSkill(id: string): Promise<{ deleted: boolean; id: string }> {
  try {
    const [deletedSkill] = await db
      .delete(skill)
      .where(eq(skill.id, id))
      .returning({ id: skill.id });

    if (!deletedSkill) {
      throw new Error("删除技能失败");
    }

    return {
      deleted: true,
      id: deletedSkill.id,
    };
  } catch (error) {
    console.error("删除技能失败:", error);
    throw new Error("删除技能失败");
  }
}

/**
 * 根据ID获取技能分类
 */
export async function getSkillCategoryById(id: string): Promise<SkillCategoryType | null> {
  try {
    const result = await db.query.skillCategory.findFirst({
      where: eq(skillCategory.id, id),
    });
    
    return result || null;
  } catch (error) {
    console.error("获取技能分类失败:", error);
    throw new Error("获取技能分类失败");
  }
}

/**
 * 根据分类ID获取技能列表
 */
export async function getSkillsByCategoryId(categoryId: string): Promise<SkillType[]> {
  try {
    const skills = await db.query.skill.findMany({
      where: eq(skill.categoryId, categoryId),
      orderBy: [skill.sortOrder, desc(skill.createdAt)],
    });
    
    return skills;
  } catch (error) {
    console.error("获取技能列表失败:", error);
    throw new Error("获取技能列表失败");
  }
}
