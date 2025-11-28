'use client';

import React, { useEffect, useState } from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { GalleryCard } from './gallery-card';
import { getBatchSignedUrlsAction } from '@/server/actions/resources/r2-action';

interface Gallery {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  itemCount: number;
  createdAt: Date;
  items: Array<{
    id: string;
    r2Key: string;
  }>;
}

interface GalleryListProps {
  galleries: Gallery[];
}

const pageStyles = {
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
};

export function GalleryList({ galleries }: GalleryListProps) {
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSignedUrls() {
      // 收集所有需要签名的R2 keys（每个图库的第一张图片）
      const r2Keys: string[] = [];
      const keyToGalleryMap: Record<string, string> = {};

      galleries.forEach((gallery) => {
        if (gallery.items && gallery.items.length > 0) {
          const firstImageKey = gallery.items[0].r2Key;
          r2Keys.push(firstImageKey);
          keyToGalleryMap[firstImageKey] = gallery.id;
        }
      });

      if (r2Keys.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const result = await getBatchSignedUrlsAction(r2Keys);
        
        if (result.success && result.signedUrls) {
          // 将R2 key映射转换为gallery id映射
          const urlsByGalleryId: Record<string, string> = {};
          Object.entries(result.signedUrls).forEach(([key, url]) => {
            const galleryId = keyToGalleryMap[key];
            if (galleryId) {
              urlsByGalleryId[galleryId] = url;
            }
          });
          setCoverUrls(urlsByGalleryId);
        }
      } catch (error) {
        console.error('获取签名URL失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrls();
  }, [galleries]);

  return (
    <BlurFade delay={0.3} inView>
      <div className={pageStyles.innerContainer} style={{ marginTop: '3rem' }}>
        {galleries.length === 0 ? (
          <div className={pageStyles.empty.container}>
            <p className={pageStyles.empty.title}>暂无图库</p>
            <p className={pageStyles.empty.subtitle}>更多精彩内容正在准备中...</p>
          </div>
        ) : (
          <div className={pageStyles.grid}>
            {galleries.map((gallery, index) => (
              <BlurFade key={gallery.id} delay={0.15 + index * 0.05} inView>
                <GalleryCard
                  id={gallery.id}
                  title={gallery.title}
                  slug={gallery.slug}
                  description={gallery.description}
                  itemCount={gallery.itemCount}
                  coverUrl={loading ? undefined : coverUrls[gallery.id]}
                  createdAt={gallery.createdAt}
                  index={index}
                />
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </BlurFade>
  );
}
