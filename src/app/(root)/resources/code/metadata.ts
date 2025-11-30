import type { Metadata, ResolvingMetadata } from 'next';

// 代码库页面基础信息
const CODE_TITLE = '代码库';
const CODE_DESCRIPTION = '实用代码片段与工具集合';

/**
 * 生成代码库列表页面的 metadata
 */
export async function generateCodeListMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${CODE_TITLE} - ${parentTitle}`,
    description: `${CODE_DESCRIPTION} - ${parentDescription}`,
  };
}

/**
 * 生成代码库详情页面的 metadata
 */
export async function generateCodeDetailMetadata(
  repository: {
    title: string;
    description?: string | null;
    keywords?: string[] | null;
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${repository.title} - ${CODE_TITLE} - ${parentTitle}`,
    description: `${repository.description || `查看 ${repository.title} 的代码和资源`} - ${parentDescription}`,
    keywords: repository.keywords || undefined,
  };
}

/**
 * 生成代码库不存在时的 metadata
 */
export async function generateCodeNotFoundMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `代码库未找到 - ${CODE_TITLE} - ${parentTitle}`,
    description: `您访问的代码库不存在 - ${parentDescription}`,
  };
}
