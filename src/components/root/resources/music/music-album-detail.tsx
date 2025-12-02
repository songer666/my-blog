'use client';

import React from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { Badge } from '@/components/shadcn/ui/badge';
import { BackToList } from '../shared/back-to-list';
import { Calendar, Music, Disc } from 'lucide-react';
import { TrackList } from './track-list';
import { useR2Url } from '@/components/mdx/context/r2-url-context';

interface Album {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  itemCount: number;
  coverImage: string | null;
  keywords: string[] | null;
  tags: string[] | null;
  createdAt: Date;
  items: Array<{
    id: string;
    name: string;
    r2Key: string;
    artist?: string;
    duration?: number;
    coverKey?: string;
  }>;
}

interface MusicAlbumDetailProps {
  album: Album;
}

const styles = {
  container: 'w-full pt-20 sm:pt-24 pb-24',
  subContainer: 'max-w-6xl mx-auto px-6 sm:px-8 flex flex-col gap-10',
  header: {
    wrapper: 'flex flex-col md:flex-row gap-8 items-start',
    coverWrapper: 'w-full md:w-48 lg:w-56 aspect-square shrink-0 rounded-xl overflow-hidden border border-border/40 bg-muted shadow-lg relative group',
    coverImage: 'object-cover w-full h-full transition-transform duration-500 group-hover:scale-105',
    infoWrapper: 'flex-1 flex flex-col gap-4 min-w-0 pt-2',
    title: 'text-3xl md:text-5xl font-bold tracking-tight text-foreground dark:text-foreground',
    metaRow: 'flex items-center gap-4 text-sm text-muted-foreground mt-1',
    metaItem: 'flex items-center gap-1.5',
    description: 'text-muted-foreground text-lg leading-relaxed max-w-2xl mt-2',
    tags: 'flex flex-wrap gap-2 mt-auto',
  },
};

// 封面组件，使用 useR2Url 自动刷新
function AlbumCover({ coverImage, coverKey, title }: { coverImage: string | null; coverKey?: string; title: string }) {
  const coverUrl = coverKey ? useR2Url(coverKey) : coverImage;

  return (
    <div className={styles.header.coverWrapper}>
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={title}
          className={styles.header.coverImage}
          loading="eager"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
          <Disc className="w-20 h-20 opacity-20" />
        </div>
      )}
    </div>
  );
}

export function MusicAlbumDetail({ album }: MusicAlbumDetailProps) {
  // 获取封面 key
  const coverKey = !album.coverImage && album.items && album.items.length > 0
    ? album.items.find(item => item.coverKey)?.coverKey
    : undefined;

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        {/* 返回按钮 */}
        <BackToList href="/resources/music" label="返回音乐列表" />

        {/* Header Section */}
        <BlurFade delay={0.1} inView>
          <div className={styles.header.wrapper}>
            <AlbumCover 
              coverImage={album.coverImage} 
              coverKey={coverKey} 
              title={album.title} 
            />

            <div className={styles.header.infoWrapper}>
              <h1 className={styles.header.title}>{album.title}</h1>
              
              <div className={styles.header.metaRow}>
                <div className={styles.header.metaItem}>
                  <Calendar className="w-4 h-4" />
                  <time>{new Date(album.createdAt).toLocaleDateString('zh-CN')}</time>
                </div>
                <div className={styles.header.metaItem}>
                  <Music className="w-4 h-4" />
                  <span>{album.itemCount} 首歌曲</span>
                </div>
              </div>

              {album.description && (
                <p className={styles.header.description}>
                  {album.description}
                </p>
              )}

              {(album.keywords || album.tags) && (
                <div className={styles.header.tags}>
                  {[...(album.keywords || []), ...(album.tags || [])].map((tag, idx) => (
                    <Badge key={idx} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </BlurFade>

        {/* Track List */}
        <TrackList 
          tracks={album.items}
          albumTitle={album.title}
          albumSlug={album.slug}
          coverImage={album.coverImage}
          coverKey={coverKey}
        />
      </div>
    </div>
  );
}
