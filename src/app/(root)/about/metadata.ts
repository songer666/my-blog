import type { Metadata, ResolvingMetadata } from 'next';

// 关于页面基础信息
const ABOUT_TITLE = '关于我';
const ABOUT_DESCRIPTION = '了解更多关于我的信息';

/**
 * 生成关于页面的 metadata
 */
export async function generateAboutMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${ABOUT_TITLE} - ${parentTitle}`,
    description: `${ABOUT_DESCRIPTION} - ${parentDescription}`,
  };
}
