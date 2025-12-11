"use client";

import React from 'react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Calendar, ImageIcon } from 'lucide-react';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { BackToList } from '../../shared/back-to-list';
import { ImageMasonryGridWithR2 } from './image-masonry-grid-r2';
import type { ImageGallery } from '@/server/types/resources-type';

interface GalleryDetailProps {
  gallery: ImageGallery;
}

const styles = {
  container: 'w-full pt-20 sm:pt-24 pb-16',
  subContainer: 'max-w-6xl mx-auto px-6 sm:px-8 flex flex-col gap-8',
  dividerContainer: 'relative w-full h-px max-w-6xl mx-auto mt-0 mb-0 z-20 overflow-visible',
  divider: 'absolute inset-0 bg-border hover:h-[2px] hover:-translate-y-[0.5px] transition-all duration-200',
  header: {
    wrapper: 'flex flex-col gap-4 pb-8',
    title: `font-display text-3xl md:text-4xl font-semibold tracking-tighter 
      text-violet-500 dark:text-violet-500 
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`.trim(),
    description: 'font-sans text-muted-foreground text-base leading-relaxed',
    metaRow: 'flex items-center gap-4 text-sm text-muted-foreground mt-2',
    metaItem: 'flex items-center gap-1.5',
    tags: 'flex flex-wrap gap-2 mt-4',
  },
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function GalleryDetail({ gallery }: GalleryDetailProps) {
  // 准备图片数据，包含 r2Key
  const images = gallery.items.map(item => ({
    id: item.id,
    r2Key: item.r2Key,
    name: item.name,
    alt: item.alt,
    width: item.width,
    height: item.height,
    fileSize: item.fileSize,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        {/* 返回按钮 */}
        <BackToList href="/resources/image" label="返回图库列表" />

        {/* Header Section */}
          <div className={styles.header.wrapper}>
            <h1 className={styles.header.title}>{gallery.title}</h1>
            
            {gallery.description && (
              <p className={styles.header.description}>{gallery.description}</p>
            )}

            <div className={styles.header.metaRow}>
              <div className={styles.header.metaItem}>
                <Calendar className="w-4 h-4" />
                <time>{formatDate(gallery.createdAt)}</time>
              </div>
              <div className={styles.header.metaItem}>
                <ImageIcon className="w-4 h-4" />
                <span>{gallery.itemCount} 张图片</span>
              </div>
            </div>

            {gallery.keywords && gallery.keywords.length > 0 && (
              <div className={styles.header.tags}>
                {gallery.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>

        {/* BorderBeam 分隔线 */}
        <div className={styles.dividerContainer}>
          <div className={styles.divider} />
          <BorderBeam 
            size={200}
            duration={8}
            delay={0}
            colorFrom="#8b5cf6"
            colorTo="#a78bfa"
            borderWidth={1}
          />
        </div>

        {/* Image Grid */}
        <ImageMasonryGridWithR2 images={images} galleryTitle={gallery.title} />
      </div>
    </div>
  );
}
