'use client';

import React, { useEffect, useState } from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { Badge } from '@/components/shadcn/ui/badge';
import { BackToList } from '../shared/back-to-list';
import { Calendar, Music, Disc } from 'lucide-react';
import { TrackList } from './track-list';
import { getBatchSignedUrlsAction } from '@/server/actions/resources/r2-action';

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

export function MusicAlbumDetail({ album }: MusicAlbumDetailProps) {
  const [coverUrl, setCoverUrl] = useState<string | null>(album.coverImage);
  const [trackUrls, setTrackUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignedUrls() {
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

      if (r2Keys.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const result = await getBatchSignedUrlsAction(r2Keys);
        
        if (result.success && result.signedUrls) {
          const signedUrls = result.signedUrls as Record<string, string>;
          
          // 设置封面URL
          if (!album.coverImage && album.items && album.items.length > 0) {
            const itemWithCover = album.items.find(item => item.coverKey);
            if (itemWithCover && itemWithCover.coverKey && signedUrls[itemWithCover.coverKey]) {
              setCoverUrl(signedUrls[itemWithCover.coverKey]);
            }
          }
          
          // 设置音轨URLs
          const urls: Record<string, string> = {};
          album.items.forEach(track => {
            if (signedUrls[track.r2Key]) {
              urls[track.id] = signedUrls[track.r2Key];
            }
          });
          setTrackUrls(urls);
        }
      } catch (error) {
        console.error('获取签名URL失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrls();
  }, [album]);

  // 将音轨数据与URL合并
  const enrichedTracks = album.items.map(track => ({
    ...track,
    url: trackUrls[track.id] || null,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        {/* 返回按钮 */}
        <BackToList href="/resources/music" label="返回音乐列表" />

        {/* Header Section */}
        <BlurFade delay={0.1} inView>
          <div className={styles.header.wrapper}>
            <div className={styles.header.coverWrapper}>
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={album.title}
                  className={styles.header.coverImage}
                  loading="eager"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Disc className="w-20 h-20 opacity-20" />
                </div>
              )}
            </div>

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
          tracks={enrichedTracks}
          albumTitle={album.title}
          albumSlug={album.slug}
          coverUrl={coverUrl}
        />
      </div>
    </div>
  );
}
