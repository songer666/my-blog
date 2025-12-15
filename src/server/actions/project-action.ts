import { db } from "@/db";
import { project } from "@/db/schema/project";
import { eq, and, desc, count } from "drizzle-orm";
import { ProjectCreateType, ProjectUpdateType, ProjectType, ProjectListItemType } from "@/server/types/project-type";

/**
 * 获取所有项目
 */
export async function getAllProjects(): Promise<ProjectType[]> {
  try {
    const result = await db.query.project.findMany({
      orderBy: (project, { desc }) => [desc(project.createdAt)],
    });
    
    return result;
  } catch (error) {
    console.error("获取项目列表失败:", error);
    throw new Error("获取项目列表失败");
  }
}

/**
 * 根据ID获取项目
 */
export async function getProjectById(id: string): Promise<ProjectType | null> {
  try {
    const result = await db.query.project.findFirst({
      where: eq(project.id, id),
    });
    
    return result || null;
  } catch (error) {
    console.error("获取项目失败:", error);
    throw new Error("获取项目失败");
  }
}

/**
 * 根据slug获取项目
 */
export async function getProjectBySlug(slug: string): Promise<ProjectType | null> {
  try {
    const result = await db.query.project.findFirst({
      where: eq(project.slug, slug),
    });
    
    return result || null;
  } catch (error) {
    console.error("获取项目失败:", error);
    throw new Error("获取项目失败");
  }
}

/**
 * 创建项目
 */
export async function createProject(data: ProjectCreateType): Promise<ProjectType> {
  try {
    console.log("创建项目数据:", JSON.stringify(data, null, 2));
    
    // 确保必需字段存在
    const insertData: any = {
      title: data.title,
      description: data.description,
      slug: data.slug,
      content: data.content,
      image: data.image || null,
      githubUrl: data.githubUrl || null,
      demoUrl: data.demoUrl || null,
      keyWords: data.keyWords || null,
      visible: data.visible ?? false,
    };
    
    // 如果提供了自定义创建时间，则使用它
    if (data.createdAt) {
      insertData.createdAt = data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt);
    }
    
    console.log("插入数据:", JSON.stringify(insertData, null, 2));
    
    // 创建项目
    const [newProject] = await db
      .insert(project)
      .values(insertData)
      .returning();

    if (!newProject) {
      throw new Error("创建项目失败");
    }

    return newProject;
  } catch (error) {
    console.error("创建项目失败:", error);
    console.error("错误详情:", error);
    throw error;
  }
}

/**
 * 更新项目
 */
export async function updateProject(id: string, data: ProjectUpdateType): Promise<ProjectType> {
  try {
    // 检查项目是否存在
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, id),
    });
    
    if (!existingProject) {
      throw new Error("项目不存在");
    }

    // 准备更新数据
    const { createdAt, ...projectData } = data;
    const updateData: any = {
      ...projectData,
      updatedAt: new Date(),
    };
    
    // 如果提供了自定义创建时间，则使用它
    if (createdAt) {
      updateData.createdAt = createdAt instanceof Date ? createdAt : new Date(createdAt);
    }

    // 更新项目基本信息
    const [updatedProject] = await db
      .update(project)
      .set(updateData)
      .where(eq(project.id, id))
      .returning();

    if (!updatedProject) {
      throw new Error("更新项目失败");
    }

    return updatedProject;
  } catch (error) {
    console.error("更新项目失败:", error);
    throw error;
  }
}

/**
 * 删除项目
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    // 检查项目是否存在
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, id),
    });
    
    if (!existingProject) {
      throw new Error("项目不存在");
    }

    // 删除项目
    await db.delete(project).where(eq(project.id, id));
  } catch (error) {
    console.error("删除项目失败:", error);
    throw error;
  }
}

/**
 * 切换项目可见性
 */
export async function toggleProjectVisibility(id: string): Promise<ProjectType> {
  try {
    // 获取当前项目状态
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, id),
    });
    
    if (!existingProject) {
      throw new Error("项目不存在");
    }

    // 切换可见性
    const [updatedProject] = await db
      .update(project)
      .set({
        visible: !existingProject.visible,
        updatedAt: new Date(),
      })
      .where(eq(project.id, id))
      .returning();

    if (!updatedProject) {
      throw new Error("更新项目可见性失败");
    }

    return updatedProject;
  } catch (error) {
    console.error("切换项目可见性失败:", error);
    throw error;
  }
}

/**
 * 根据slug检查项目是否存在（用于验证URL别名唯一性）
 */
export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  try {
    let existingProject;
    
    if (excludeId) {
      // 排除指定ID的项目，检查其他项目是否使用了这个slug
      existingProject = await db.query.project.findFirst({
        where: (project, { and, eq, ne }) => and(
          eq(project.slug, slug),
          ne(project.id, excludeId)
        ),
      });
    } else {
      // 检查是否有任何项目使用了这个slug
      existingProject = await db.query.project.findFirst({
        where: eq(project.slug, slug),
      });
    }
    
    return !!existingProject;
  } catch (error) {
    console.error("检查slug失败:", error);
    return false;
  }
}

/**
 * 关联代码库到项目
 */
export async function linkCodeRepository(projectId: string, codeRepositoryId: string | null): Promise<ProjectType> {
  try {
    // 检查项目是否存在
    const existingProject = await db.query.project.findFirst({
      where: eq(project.id, projectId),
    });
    
    if (!existingProject) {
      throw new Error("项目不存在");
    }

    // 更新项目的代码库关联
    const [updatedProject] = await db
      .update(project)
      .set({
        codeRepositoryId,
        updatedAt: new Date(),
      })
      .where(eq(project.id, projectId))
      .returning();

    if (!updatedProject) {
      throw new Error("关联代码库失败");
    }

    return updatedProject;
  } catch (error) {
    console.error("关联代码库失败:", error);
    throw error;
  }
}

/**
 * 获取所有公开项目（不分页）
 */
export async function getAllPublicProjects(): Promise<ProjectListItemType[]> {
  try {
    // 获取所有可见项目，不查询 content 字段以减少体积
    const projects = await db.query.project.findMany({
      where: eq(project.visible, true),
      orderBy: [desc(project.createdAt)],
      columns: {
        id: true,
        title: true,
        description: true,
        slug: true,
        content: false,
        image: true,
        githubUrl: true,
        demoUrl: true,
        visible: true,
        keyWords: true,
        codeRepositoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return projects;
  } catch (error) {
    console.error("获取公开项目列表失败:", error);
    throw new Error("获取公开项目列表失败");
  }
}

/**
 * 根据slug获取公开的项目
 */
export async function getPublicProjectBySlug(slug: string): Promise<ProjectType | null> {
  try {
    // 不查询image字段以减少体积
    const result = await db.query.project.findFirst({
      where: and(eq(project.slug, slug), eq(project.visible, true)),
      columns: {
        id: true,
        title: true,
        description: true,
        slug: true,
        content: true,
        image: false,
        githubUrl: true,
        demoUrl: true,
        visible: true,
        keyWords: true,
        codeRepositoryId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return (result as ProjectType) || null;
  } catch (error) {
    console.error("获取公开项目失败:", error);
    throw new Error("获取公开项目失败");
  }
}

