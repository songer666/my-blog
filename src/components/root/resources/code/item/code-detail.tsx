"use client";

import React, { useState } from 'react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Layers, ImageIcon, Calendar } from 'lucide-react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { BackToList } from '../../shared/back-to-list';
import { CodeBrowser } from '@/components/admin/resources/code/browser/code-browser';
import { ImageLightbox } from './image-lightbox';
import { useR2UrlWithRefresh } from '@/components/mdx/context/r2-url-context';
import type { CodeRepository } from '@/server/types/resources-type';

interface CodeDetailProps {
  repository: CodeRepository;
}

const styles = {
  container: 'w-full pt-20 sm:pt-24 pb-16',
  subContainer: 'max-w-5xl mx-auto px-6 sm:px-8 flex flex-col gap-8',
  dividerContainer: 'relative w-full h-px max-w-5xl mx-auto mt-0 mb-0 z-20 overflow-visible',
  divider: 'absolute inset-0 bg-border hover:h-[2px] hover:-translate-y-[0.5px] transition-all duration-200',
  header: {
    wrapper: 'flex flex-col gap-4 pb-8',
    title: `font-display text-3xl md:text-4xl font-semibold tracking-tighter 
      text-violet-500 dark:text-violet-500 
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`.trim(),
    metaRow: 'flex items-center gap-4 text-sm text-muted-foreground',
    metaItem: 'flex items-center gap-1.5',
    description: 'font-sans text-muted-foreground text-base leading-relaxed',
    tags: 'flex flex-wrap gap-2 pt-2',
  },
  section: {
    wrapper: 'flex flex-col gap-4',
    title: 'text-xl font-semibold tracking-tight',
  },
  demoImages: {
    container: 'flex flex-col gap-4 px-4 sm:px-6',
    imageWrapper: 'relative w-full overflow-hidden rounded-lg border border-border/40 bg-muted cursor-pointer group',
    image: 'w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110',
  },
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// 单个演示图片组件，使用 useR2UrlWithRefresh 自动刷新
function DemoImageCard({ 
  r2Key, 
  alt, 
  onClick 
}: { 
  r2Key: string; 
  alt: string; 
  onClick: (url: string) => void;
}) {
  const { url, refresh } = useR2UrlWithRefresh(r2Key);
  const [hasError, setHasError] = React.useState(false);
  const [retryCount, setRetryCount] = React.useState(0);

  const handleImageError = async () => {
    if (retryCount >= 2) {
      setHasError(true);
      return;
    }
    setRetryCount(prev => prev + 1);
    await refresh();
  };

  return (
    <div
      className={styles.demoImages.imageWrapper}
      onClick={() => url && onClick(url)}
    >
      {url && !hasError ? (
        <img
          src={url}
          alt={alt}
          className={styles.demoImages.image}
          loading="lazy"
          onError={handleImageError}
        />
      ) : (
        <div className="w-full aspect-video flex items-center justify-center text-muted-foreground">
          <ImageIcon className="w-10 h-10 opacity-20" />
        </div>
      )}
    </div>
  );
}

export function CodeDetail({ repository }: CodeDetailProps) {
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // 准备演示图片数据
  const demoImages = repository.demoImages?.filter(img => img.r2Key) || [];

  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        {/* 返回按钮 */}
        <BackToList href="/resources/code" label="返回代码库列表" />

        {/* Header Section */}
        <BlurFade delay={0.1} inView>
          <div className={styles.header.wrapper}>
            <h1 className={styles.header.title}>{repository.title}</h1>
            
            <div className={styles.header.metaRow}>
              <div className={styles.header.metaItem}>
                <Layers className="w-4 h-4" />
                <span>{repository.itemCount} 个文件</span>
              </div>
              {repository.createdAt && (
                <div className={styles.header.metaItem}>
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(repository.createdAt)}</span>
                </div>
              )}
            </div>

            {repository.description && (
              <p className={styles.header.description}>{repository.description}</p>
            )}

            {repository.keywords && repository.keywords.length > 0 && (
              <div className={styles.header.tags}>
                {repository.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </BlurFade>

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

        {/* Code Browser Section */}
        {repository.items && repository.items.length > 0 && (
          <BlurFade delay={0.2} inView>
            <div className={styles.section.wrapper}>
              <h2 className={styles.section.title}>代码文件</h2>
              <CodeBrowser files={repository.items} />
            </div>
          </BlurFade>
        )}

        {/* Demo Images Section */}
        {demoImages.length > 0 && (
          <BlurFade delay={0.3} inView>
            <div className={styles.section.wrapper}>
              <h2 className={styles.section.title}>演示图片</h2>
              <div className={styles.demoImages.container}>
                {demoImages.map((image, idx) => (
                  <DemoImageCard
                    key={image.id || idx}
                    r2Key={image.r2Key!}
                    alt={`${repository.title} 演示图 ${idx + 1}`}
                    onClick={setLightboxImage}
                  />
                ))}
              </div>
            </div>
          </BlurFade>
        )}
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightboxImage || ''}
        alt={repository.title}
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
      />
    </div>
  );
}
