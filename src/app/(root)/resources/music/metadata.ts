import type { Metadata, ResolvingMetadata } from 'next';

// 曲库页面基础信息
const MUSIC_TITLE = '曲库';
const MUSIC_DESCRIPTION = '聆听美好，分享感动';

/**
 * 生成曲库列表页面的 metadata
 */
export async function generateMusicListMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `${MUSIC_TITLE} - ${parentTitle}`,
    description: `${MUSIC_DESCRIPTION} - ${parentDescription}`,
  };
}

/**
 * 生成曲库详情页面的 metadata
 */
export async function generateMusicDetailMetadata(
  album: {
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
    title: `${album.title} - ${MUSIC_TITLE} - ${parentTitle}`,
    description: `${album.description || `收听 ${album.title} 专辑`} - ${parentDescription}`,
    keywords: album.keywords || undefined,
  };
}

/**
 * 生成曲库不存在时的 metadata
 */
export async function generateMusicNotFoundMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const parentMetadata = await parent;
  const parentTitle = parentMetadata.title?.absolute || '气质猫咪';
  const parentDescription = parentMetadata.description || '气质猫咪的个人博客，练习时长两年半的ts全栈开发者';

  return {
    title: `专辑未找到 - ${MUSIC_TITLE} - ${parentTitle}`,
    description: `您访问的专辑不存在 - ${parentDescription}`,
  };
}
