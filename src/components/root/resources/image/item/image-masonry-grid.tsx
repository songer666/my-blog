"use client";

import React, { useState, useEffect } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { Button } from '@/components/shadcn/ui/button';
import { ImageLightbox } from '../../code/item/image-lightbox';

interface ImageItem {
  id: string;
  url: string | null;
  name: string;
  alt?: string | null;
  width: number;
  height: number;
  fileSize: number;
}

interface ImageMasonryGridProps {
  images: ImageItem[];
  galleryTitle: string;
}

const styles = {
  masonry: 'columns-1 sm:columns-2 lg:columns-3 gap-4',
  imageCard: {
    wrapper: 'group relative break-inside-avoid mb-4 rounded-lg overflow-hidden bg-muted cursor-pointer block',
    image: 'w-full h-auto block transition-transform duration-500 group-hover:scale-105',
    overlay: 'absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 pointer-events-none',
  },
  loadMore: {
    container: 'flex justify-center items-center mt-8',
    button: 'min-w-[200px]',
  },
};

const BATCH_SIZE = 10; // 每次加载10张图片

export function ImageMasonryGrid({ images, galleryTitle }: ImageMasonryGridProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [displayedCount, setDisplayedCount] = useState(BATCH_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  // 当前显示的图片
  const displayedImages = images.slice(0, displayedCount);
  const hasMore = displayedCount < images.length;

  // 加载更多图片
  const loadMore = () => {
    setIsLoading(true);
    // 模拟加载延迟
    setTimeout(() => {
      setDisplayedCount(prev => Math.min(prev + BATCH_SIZE, images.length));
      setIsLoading(false);
    }, 300);
  };

  // 自动加载：当滚动到底部时加载更多
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // 距离底部200px时触发加载
      if (scrollHeight - scrollTop - clientHeight < 200) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading, hasMore]);

  return (
    <>
      {/* Masonry Image Grid */}
      <BlurFade delay={0.2} inView>
        <div className={styles.masonry}>
          {displayedImages.map((item) => (
            <div
              key={item.id}
              className={styles.imageCard.wrapper}
              onClick={() => item.url && setLightboxImage(item.url)}
            >
              {item.url ? (
                <img
                  src={item.url}
                  alt={item.alt || item.name}
                  className={styles.imageCard.image}
                  loading="lazy"
                />
              ) : (
                <div className="w-full aspect-[4/3] flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                </div>
              )}
              <div className={styles.imageCard.overlay} />
            </div>
          ))}
        </div>
      </BlurFade>

      {/* 加载更多按钮 */}
      {hasMore && (
        <div className={styles.loadMore.container}>
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className={styles.loadMore.button}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                加载中...
              </>
            ) : (
              <>
                加载更多 ({displayedCount} / {images.length})
              </>
            )}
          </Button>
        </div>
      )}

      {/* 已全部加载提示 */}
      {!hasMore && images.length > BATCH_SIZE && (
        <div className="text-center text-sm text-muted-foreground mt-8">
          已加载全部 {images.length} 张图片
        </div>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage || ''}
        alt={galleryTitle}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </>
  );
}
