'use client';

import React from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { GalleryCard } from './gallery-card';

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
  // 直接从环境变量获取 R2 公开 URL
  const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '';

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
            {galleries.map((gallery, index) => {
              // 客户端直接拼接完整的封面 URL
              const coverUrl = R2_PUBLIC_URL && gallery.items[0]?.r2Key
                ? `${R2_PUBLIC_URL}${gallery.items[0].r2Key}`
                : undefined;
              
              return (
                <BlurFade key={gallery.id} delay={0.15 + index * 0.05} inView>
                  <GalleryCard
                    id={gallery.id}
                    title={gallery.title}
                    slug={gallery.slug}
                    description={gallery.description}
                    itemCount={gallery.itemCount}
                    coverUrl={coverUrl}
                    createdAt={gallery.createdAt}
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
