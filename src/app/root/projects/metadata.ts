import type { Metadata, ResolvingMetadata } from 'next';

// 项目页面基础信息
const PROJECTS_TITLE = '项目展示';
const PROJECTS_DESCRIPTION = '浏览所有项目';

/**
 * 生成项目列表页面的 metadata
 */
export async function generateProjectsListMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${PROJECTS_TITLE} - ${parentTitle}`,
    description: `${PROJECTS_DESCRIPTION} - ${parentDescription}`,
  };
}

/**
 * 生成项目详情页面的 metadata
 */
export async function generateProjectDetailMetadata(
  project: {
    title: string;
    description: string;
    keyWords?: string | null;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${project.title} - ${PROJECTS_TITLE} - ${parentTitle}`,
    description: `${project.description} - ${parentDescription}`,
    keywords: project.keyWords || undefined,
  };
}

/**
 * 生成项目不存在时的 metadata
 */
export async function generateNotFoundMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `项目不存在 - ${PROJECTS_TITLE} - ${parentTitle}`,
    description: `您访问的项目不存在 - ${parentDescription}`,
  };
}

