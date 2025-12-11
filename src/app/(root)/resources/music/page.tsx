import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { MusicAlbumList } from '@/components/root/resources/music/music-album-list';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { generateMusicListMetadata } from './metadata';

// 强制静态生成（SSG）
export const dynamic = 'force-static';

// 生成页面 metadata
export async function generateMetadata(
  props: any,
  parent: any
) {
  return await generateMusicListMetadata(parent);
}
// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

const pageStyles = {
  container: 'w-full pt-20 sm:pt-24',
  subContainer: 'p-6 max-w-7xl mx-auto flex flex-col gap-6',
  dividerContainer: 'relative w-full h-px max-w-7xl mx-auto mt-8 mb-0 z-20 overflow-visible',
  divider: 'absolute inset-0 bg-border hover:h-[2px] hover:-translate-y-[0.5px] transition-all duration-200',
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  header: {
    container: 'max-w-6xl px-6 flex flex-col gap-2',
    title: `font-display text-4xl md:text-4xl font-semibold tracking-tighter 
      text-violet-500 dark:text-violet-500 
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`.trim(),
    subtitle: 'text-sm text-muted-foreground/80 font-sans flex items-center gap-1.5',
    description: 'text-muted-foreground text-sm md:text-base font-sans text-left',
  },
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
};

export default async function MusicResourcesPage() {
  const queryClient = getQueryClient();
  const albums = await queryClient.fetchQuery(
    trpc.musicAlbum.allPublic.queryOptions()
  );

  return (
    <div className={pageStyles.container}>
      {/* Header */}
        <div className={pageStyles.subContainer}>
          <div className={pageStyles.header.container}>
            <h1 className={pageStyles.header.title}>曲库</h1>
            <p className={pageStyles.header.description}>
              聆听美好，分享感动
            </p>
          </div>
        </div>

      {/* BorderBeam 分隔线 */}
      <div className={pageStyles.dividerContainer}>
        <div className={pageStyles.divider} />
        <BorderBeam 
          size={200}
          duration={8}
          delay={0}
          colorFrom="#8b5cf6"
          colorTo="#a78bfa"
          borderWidth={1}
        />
      </div>

      {/* List */}
      <MusicAlbumList albums={albums} />
    </div>
  );
}
