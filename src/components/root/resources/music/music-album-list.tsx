'use client';

import React, { useEffect, useState } from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { MusicCard } from './music-card';
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
    coverKey?: string;
  }>;
}

interface MusicAlbumListProps {
  albums: Album[];
}

const pageStyles = {
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
};

export function MusicAlbumList({ albums }: MusicAlbumListProps) {
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignedUrls() {
      // 收集需要签名的R2 keys
      const r2Keys: string[] = [];
      const keyToAlbumMap: Record<string, string> = {};

      albums.forEach((album) => {
        // 如果没有base64封面，尝试从歌曲中找封面
        if (!album.coverImage && album.items && album.items.length > 0) {
          const itemWithCover = album.items.find(item => item.coverKey);
          if (itemWithCover && itemWithCover.coverKey) {
            r2Keys.push(itemWithCover.coverKey);
            keyToAlbumMap[itemWithCover.coverKey] = album.id;
          }
        }
      });

      if (r2Keys.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const result = await getBatchSignedUrlsAction(r2Keys);
        
        if (result.success && result.signedUrls) {
          const signedUrls = result.signedUrls as Record<string, string>;
          // 将R2 key映射转换为album id映射
          const urlsByAlbumId: Record<string, string> = {};
          Object.entries(signedUrls).forEach(([key, url]) => {
            const albumId = keyToAlbumMap[key];
            if (albumId) {
              urlsByAlbumId[albumId] = url;
            }
          });
          setCoverUrls(urlsByAlbumId);
        }
      } catch (error) {
        console.error('获取签名URL失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrls();
  }, [albums]);

  return (
    <BlurFade delay={0.3} inView>
      <div className={pageStyles.innerContainer} style={{ marginTop: '3rem' }}>
        {albums.length === 0 ? (
          <div className={pageStyles.empty.container}>
            <p className={pageStyles.empty.title}>暂无专辑</p>
            <p className={pageStyles.empty.subtitle}>更多精彩内容正在准备中...</p>
          </div>
        ) : (
          <div className={pageStyles.grid}>
            {albums.map((album, index) => {
              // 优先使用base64封面，否则使用签名URL
              const coverUrl = album.coverImage || (loading ? undefined : coverUrls[album.id]);
              
              return (
                <BlurFade key={album.id} delay={0.15 + index * 0.05} inView>
                  <MusicCard
                    id={album.id}
                    title={album.title}
                    slug={album.slug}
                    description={album.description}
                    itemCount={album.itemCount}
                    coverUrl={coverUrl}
                    keywords={album.keywords}
                    tags={album.tags}
                    createdAt={album.createdAt}
                    index={index}
                  />
                </BlurFade>
              );
            })}
          </div>
        )}
      </div>
    </BlurFade>
  );
}
