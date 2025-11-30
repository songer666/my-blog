import type { Metadata, ResolvingMetadata } from 'next';

// 博客页面基础信息
const BLOG_TITLE = '博客文章';
const BLOG_DESCRIPTION = '浏览所有博客文章';

/**
 * 生成博客列表页面的 metadata
 */
export async function generateBlogListMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${BLOG_TITLE} - ${parentTitle}`,
    description: `${BLOG_DESCRIPTION} - ${parentDescription}`,
  };
}

/**
 * 生成博客详情页面的 metadata
 */
export async function generateBlogPostMetadata(
  post: {
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
    title: `${post.title} - ${BLOG_TITLE} - ${parentTitle}`,
    description: `${post.description} - ${parentDescription}`,
    keywords: post.keyWords || undefined,
  };
}

/**
 * 生成文章不存在时的 metadata
 */
export async function generateNotFoundMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `文章不存在 - ${BLOG_TITLE} - ${parentTitle}`,
    description: `您访问的文章不存在 - ${parentDescription}`,
  };
}
