import type { Metadata, ResolvingMetadata } from 'next';

// 图库页面基础信息
const GALLERY_TITLE = '图库';
const GALLERY_DESCRIPTION = '精选图片与视觉灵感';

/**
 * 生成图库列表页面的 metadata
 */
export async function generateGalleryListMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${GALLERY_TITLE} - ${parentTitle}`,
    description: `${GALLERY_DESCRIPTION} - ${parentDescription}`,
  };
}

/**
 * 生成图库详情页面的 metadata
 */
export async function generateGalleryDetailMetadata(
  gallery: {
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
    title: `${gallery.title} - ${GALLERY_TITLE} - ${parentTitle}`,
    description: `${gallery.description || `查看 ${gallery.title} 的精选图片`} - ${parentDescription}`,
    keywords: gallery.keywords || undefined,
  };
}

/**
 * 生成图库不存在时的 metadata
 */
export async function generateGalleryNotFoundMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `图库未找到 - ${GALLERY_TITLE} - ${parentTitle}`,
    description: `您访问的图库不存在 - ${parentDescription}`,
  };
}
