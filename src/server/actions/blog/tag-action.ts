import { db } from "@/db";
import { tag, postTags, post } from "@/db/schema/blog";
import { eq, and, count, sql } from "drizzle-orm";
import { TagUpdateType, TagType } from "@/server/types/blog-type";

/**
 * 获取所有标签
 */
export async function getAllTags(): Promise<TagType[]> {
  try {
    const result = await db.query.tag.findMany({
      orderBy: (tag, { desc }) => [desc(tag.createdAt)],
    });
    
    return result;
  } catch (error) {
    console.error("获取标签列表失败:", error);
    throw new Error("获取标签列表失败");
  }
}

/**
 * 根据ID获取标签
 */
export async function getTagById(id: string): Promise<TagType | null> {
  try {
    const result = await db.query.tag.findFirst({
      where: eq(tag.id, id),
    });
    
    return result || null;
  } catch (error) {
    console.error("获取标签失败:", error);
    throw new Error("获取标签失败");
  }
}

/**
 * 创建标签
 */
export async function createTag(data: TagUpdateType): Promise<TagType> {
  try {
    // 检查标签名是否已存在
    const existingTag = await db.query.tag.findFirst({
      where: eq(tag.name, data.name),
    });

    if (existingTag) {
      throw new Error("标签名称已存在");
    }

    const [newTag] = await db
      .insert(tag)
      .values({
        name: data.name,
      })
      .returning();

    if (!newTag) {
      throw new Error("创建标签失败");
    }

    return newTag;
  } catch (error) {
    console.error("创建标签失败:", error);
    throw error;
  }
}

/**
 * 更新标签
 */
export async function updateTag(id: string, data: TagUpdateType): Promise<TagType> {
  try {
    // 检查标签是否存在
    const existingTag = await getTagById(id);
    if (!existingTag) {
      throw new Error("标签不存在");
    }

    // 检查新名称是否与其他标签重复
    const duplicateTag = await db.query.tag.findFirst({
      where: (tag, { and, eq, ne }) => and(
        eq(tag.name, data.name),
        ne(tag.id, id)
      ),
    });

    if (duplicateTag) {
      throw new Error("标签名称已存在");
    }

    const [updatedTag] = await db
      .update(tag)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(tag.id, id))
      .returning();

    if (!updatedTag) {
      throw new Error("更新标签失败");
    }

    return updatedTag;
  } catch (error) {
    console.error("更新标签失败:", error);
    throw error;
  }
}

/**
 * 删除标签
 */
export async function deleteTag(id: string): Promise<void> {
  try {
    // 检查标签是否存在
    const existingTag = await getTagById(id);
    if (!existingTag) {
      throw new Error("标签不存在");
    }

    // 删除标签（由于外键约杞，相关的 postTags 记录会自动删除）
    await db.delete(tag).where(eq(tag.id, id));
  } catch (error) {
    console.error("删除标签失败:", error);
    throw error;
  }
}

/**
 * 获取所有公开标签及其文章数量
 */
export async function getPublicTagsWithCount(): Promise<Array<TagType & { postCount: number }>> {
  try {
    // 获取所有标签
    const tags = await db.query.tag.findMany({
      orderBy: (tag, { asc }) => [asc(tag.name)],
    });

    // 为每个标签获取公开文章数量
    const tagsWithCount = await Promise.all(
      tags.map(async (t) => {
        const countResult = await db
          .select({ count: count() })
          .from(postTags)
          .innerJoin(post, eq(postTags.postId, post.id))
          .where(and(eq(postTags.tagId, t.id), eq(post.visible, true)));

        return {
          ...t,
          postCount: countResult[0]?.count || 0,
        };
      })
    );

    // 过滤掉文章数为0的标签
    return tagsWithCount.filter(t => t.postCount > 0);
  } catch (error) {
    console.error("获取公开标签失败:", error);
    throw new Error("获取公开标签失败");
  }
}
