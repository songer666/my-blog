import React from 'react';
import { notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { generateMusicDetailMetadata, generateMusicNotFoundMetadata } from '../metadata';
import { MusicAlbumDetail } from '@/components/root/resources/music/music-album-detail';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';
import { getBatchSignedUrlsAction } from '@/server/actions/resources/r2-action';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 强制静态生成（SSG）
export const dynamic = 'force-static';

export async function generateMetadata(
  { params }: PageProps,
  parent: any
) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const album = await queryClient.fetchQuery(
    trpc.musicAlbum.bySlugPublic.queryOptions({ slug })
  );

  if (!album) {
    return await generateMusicNotFoundMetadata(parent);
  }

  return await generateMusicDetailMetadata(album, parent);
}

const styles = {
  container: 'w-full pt-20 sm:pt-24 pb-24',
  subContainer: 'max-w-6xl mx-auto px-6 sm:px-8 flex flex-col gap-10',
  header: {
    wrapper: 'flex flex-col md:flex-row gap-8 items-start',
    coverWrapper: 'w-full md:w-48 lg:w-56 aspect-square shrink-0 rounded-xl overflow-hidden border border-border/40 bg-muted shadow-lg relative group',
    coverImage: 'object-cover w-full h-full transition-transform duration-500 group-hover:scale-105',
    infoWrapper: 'flex-1 flex flex-col gap-4 min-w-0 pt-2',
    title: 'font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground dark:text-foreground',
    metaRow: 'flex items-center gap-4 text-sm text-muted-foreground mt-1',
    metaItem: 'flex items-center gap-1.5',
    description: 'font-sans text-muted-foreground text-lg leading-relaxed max-w-2xl mt-2',
    tags: 'flex flex-wrap gap-2 mt-auto',
  },
};

export default async function MusicAlbumPage({ params }: PageProps) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const album = await queryClient.fetchQuery(
    trpc.musicAlbum.bySlugPublic.queryOptions({ slug })
  );

  if (!album) {
    notFound();
  }

  // 批量获取签名 URL（封面 + 音轨）
  const r2Keys: string[] = [];
  
  // 收集封面key（如果没有base64封面）
  if (!album.coverImage && album.items && album.items.length > 0) {
    const itemWithCover = album.items.find(item => item.coverKey);
    if (itemWithCover && itemWithCover.coverKey) {
      r2Keys.push(itemWithCover.coverKey);
    }
  }
  
  // 收集所有音轨的key
  album.items.forEach(track => {
    r2Keys.push(track.r2Key);
  });

  let signedUrls: Record<string, string> = {};
  
  if (r2Keys.length > 0) {
    const result = await getBatchSignedUrlsAction(r2Keys);
    if (result.success && result.signedUrls) {
      signedUrls = result.signedUrls as Record<string, string>;
    }
  }

  return (
    <R2UrlProvider signedUrls={signedUrls}>
      <MusicAlbumDetail album={album} />
    </R2UrlProvider>
  );
}
