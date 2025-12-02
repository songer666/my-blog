'use client';

import React, { useEffect, useState } from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { GalleryCard } from './gallery-card';
import { getGalleryCoverUrlsAction } from '@/server/actions/resources/r2-client-action';

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
    async function fetchCoverUrls() {
      try {
        const result = await getGalleryCoverUrlsAction(galleries);
        if (result.success && result.coverUrls) {
          setCoverUrls(result.coverUrls);
        }
      } catch (error) {
        console.error('获取封面 URL 失败:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoverUrls();
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
