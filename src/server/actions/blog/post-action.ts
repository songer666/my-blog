import { db } from "@/db";
import { post, postTags, tag } from "@/db/schema/blog";
import { eq, and, desc, or, like, sql, count, inArray } from "drizzle-orm";
import { PostCreateType, PostUpdateType, PostType, PostWithTagsType, PostListItemType } from "@/server/types/blog-type";

/**
 * 获取所有文章（包含标签）
 */
export async function getAllPosts(): Promise<PostWithTagsType[]> {
  try {
    const result = await db.query.post.findMany({
      with: {
        postTags: {
          with: {
            tag: true,
          },
        },
        relatedCodeRepository: true,
      },
      orderBy: (post, { desc }) => [desc(post.createdAt)],
    });
    
    // 转换数据结构，将标签和代码库提取出来
    return result.map(post => ({
      ...post,
      tags: post.postTags?.map(pt => pt.tag).filter(Boolean) || [],
      relatedCodeRepository: post.relatedCodeRepository || undefined,
    }));
  } catch (error) {
    console.error("获取文章列表失败:", error);
    throw new Error("获取文章列表失败");
  }
}

/**
 * 根据ID获取文章（包含标签）
 */
export async function getPostById(id: string): Promise<PostWithTagsType | null> {
  try {
    const result = await db.query.post.findFirst({
      where: eq(post.id, id),
      with: {
        postTags: {
          with: {
            tag: true,
          },
        },
        relatedCodeRepository: true,
      },
    });
    
    if (!result) return null;
    
    // 转换数据结构，将标签和代码库提取出来
    return {
      ...result,
      tags: result.postTags?.map(pt => pt.tag).filter(Boolean) || [],
      relatedCodeRepository: result.relatedCodeRepository || undefined,
    };
  } catch (error) {
    console.error("获取文章失败:", error);
    throw new Error("获取文章失败");
  }
}

/**
 * 创建文章
 */
export async function createPost(data: PostCreateType): Promise<PostType> {
  try {
    const { tagIds, ...postData } = data;
    
    console.log("创建文章数据:", JSON.stringify(postData, null, 2));
    
    // 确保必需字段存在
    const insertData: any = {
      title: postData.title,
      description: postData.description,
      slug: postData.slug,
      content: postData.content,
      image: postData.image || null,
      keyWords: postData.keyWords || null,
      visible: postData.visible ?? false,
      relatedCodeRepositoryId: postData.relatedCodeRepositoryId || null,
    };
    
    // 如果提供了自定义创建时间，则使用它
    if (postData.createdAt) {
      insertData.createdAt = postData.createdAt instanceof Date ? postData.createdAt : new Date(postData.createdAt);
    }
    
    console.log("插入数据:", JSON.stringify(insertData, null, 2));
    
    // 创建文章
    const [newPost] = await db
      .insert(post)
      .values(insertData)
      .returning();

    if (!newPost) {
      throw new Error("创建文章失败");
    }

    // 如果有标签，创建关联关系
    if (tagIds && tagIds.length > 0) {
      const postTagsData = tagIds.map(tagId => ({
        postId: newPost.id,
        tagId,
      }));
      
      await db.insert(postTags).values(postTagsData);
    }

    return newPost;
  } catch (error) {
    console.error("创建文章失败:", error);
    console.error("错误详情:", error);
    throw error;
  }
}

/**
 * 更新文章
 */
export async function updatePost(id: string, data: PostUpdateType): Promise<PostType> {
  try {
    // 检查文章是否存在
    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id),
    });
    
    if (!existingPost) {
      throw new Error("文章不存在");
    }

    const { tagIds, createdAt, ...postData } = data;

    // 准备更新数据
    const updateData: any = {
      ...postData,
      updatedAt: new Date(),
    };
    
    // 处理relatedCodeRepositoryId（允许为null来解除关联）
    if ('relatedCodeRepositoryId' in postData) {
      updateData.relatedCodeRepositoryId = postData.relatedCodeRepositoryId || null;
    }
    
    // 如果提供了自定义创建时间，则使用它
    if (createdAt) {
      updateData.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    }

    // 更新文章基本信息
    const [updatedPost] = await db
      .update(post)
      .set(updateData)
      .where(eq(post.id, id))
      .returning();

    if (!updatedPost) {
      throw new Error("更新文章失败");
    }

    // 更新标签关联关系
    if (tagIds !== undefined) {
      // 删除现有的标签关联
      await db.delete(postTags).where(eq(postTags.postId, id));
      
      // 创建新的标签关联
      if (tagIds.length > 0) {
        const postTagsData = tagIds.map(tagId => ({
          postId: id,
          tagId,
        }));
        
        await db.insert(postTags).values(postTagsData);
      }
    }

    return updatedPost;
  } catch (error) {
    console.error("更新文章失败:", error);
    throw error;
  }
}

/**
 * 删除文章
 */
export async function deletePost(id: string): Promise<void> {
  try {
    // 检查文章是否存在
    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id),
    });
    
    if (!existingPost) {
      throw new Error("文章不存在");
    }

    // 删除文章（由于外键约束，相关的 postTags 记录会自动删除）
    await db.delete(post).where(eq(post.id, id));
  } catch (error) {
    console.error("删除文章失败:", error);
    throw error;
  }
}

/**
 * 切换文章可见性
 */
export async function togglePostVisibility(id: string): Promise<PostType> {
  try {
    // 获取当前文章状态
    const existingPost = await db.query.post.findFirst({
      where: eq(post.id, id),
    });
    
    if (!existingPost) {
      throw new Error("文章不存在");
    }

    // 切换可见性
    const [updatedPost] = await db
      .update(post)
      .set({
        visible: !existingPost.visible,
        updatedAt: new Date(),
      })
      .where(eq(post.id, id))
      .returning();

    if (!updatedPost) {
      throw new Error("更新文章可见性失败");
    }

    return updatedPost;
  } catch (error) {
    console.error("切换文章可见性失败:", error);
    throw error;
  }
}

/**
 * 根据slug检查文章是否存在（用于验证URL别名唯一性）
 */
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    let existingPost;
    
    if (excludeId) {
      // 排除指定ID的文章，检查其他文章是否使用了这个slug
      existingPost = await db.query.post.findFirst({
        where: (post, { and, eq, ne }) => and(
          eq(post.slug, slug),
          ne(post.id, excludeId)
        ),
      });
    } else {
      // 检查是否有任何文章使用了这个slug
      existingPost = await db.query.post.findFirst({
        where: eq(post.slug, slug),
      });
    }
    
    return !!existingPost;
  } catch (error) {
    console.error("检查slug失败:", error);
    return false;
  }
}

/**
 * 公开的分页查询文章（支持搜索和标签过滤）
 */
export async function getPublicPosts(params: {
  page?: number;
  limit?: number;
  keyword?: string;
  tagName?: string;
}): Promise<{
  posts: PostListItemType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> {
  try {
    const { page = 1, limit = 6, keyword, tagName } = params;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereConditions: any[] = [eq(post.visible, true)];

    // 关键词搜索（标题、描述或关键词）
    if (keyword) {
      whereConditions.push(
        or(
          like(post.title, `%${keyword}%`),
          like(post.description, `%${keyword}%`),
          like(post.keyWords, `%${keyword}%`)
        )
      );
    }

    // 如果有标签过滤，需要联表查询
    let query;
    if (tagName) {
      // 使用子查询获取匹配标签的文章ID
      const postsWithTag = await db
        .select({ postId: postTags.postId })
        .from(postTags)
        .innerJoin(tag, eq(postTags.tagId, tag.id))
        .where(eq(tag.name, tagName));

      const postIds = postsWithTag.map(p => p.postId);

      if (postIds.length === 0) {
        return {
          posts: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      whereConditions.push(inArray(post.id, postIds));
    }

    // 获取文章列表（不包含 content 字段，减少查询流量）
    const posts = await db.query.post.findMany({
      where: whereConditions.length > 0 ? and(...whereConditions) : undefined,
      columns: {
        id: true,
        title: true,
        description: true,
        slug: true,
        image: true,
        visible: true,
        keyWords: true,
        relatedCodeRepositoryId: true,
        createdAt: true,
        updatedAt: true,
        content: false, // 列表页面不需要 content
      },
      with: {
        postTags: {
          with: {
            tag: true,
          },
        },
        relatedCodeRepository: true,
      },
      orderBy: [desc(post.createdAt)],
      limit,
      offset,
    });

    // 获取总数
    const totalResult = await db
      .select({ count: count() })
      .from(post)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    const total = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // 转换数据结构
    const postsWithTags: PostListItemType[] = posts.map(p => ({
      ...p,
      tags: p.postTags?.map(pt => pt.tag).filter(Boolean) || [],
      relatedCodeRepository: p.relatedCodeRepository || undefined,
    }));

    return {
      posts: postsWithTags,
      total,
      page,
      limit,
      totalPages,
    };
  } catch (error) {
    console.error("获取公开文章列表失败:", error);
    throw new Error("获取公开文章列表失败");
  }
}

/**
 * 根据slug获取公开的文章
 */
export async function getPublicPostBySlug(slug: string): Promise<PostWithTagsType | null> {
  try {
    const result = await db.query.post.findFirst({
      where: and(eq(post.slug, slug), eq(post.visible, true)),
      with: {
        postTags: {
          with: {
            tag: true,
          },
        },
        relatedCodeRepository: true,
      },
    });

    if (!result) return null;

    return {
      ...result,
      tags: result.postTags?.map(pt => pt.tag).filter(Boolean) || [],
      relatedCodeRepository: result.relatedCodeRepository || undefined,
    };
  } catch (error) {
    console.error("获取公开文章失败:", error);
    throw new Error("获取公开文章失败");
  }
}
