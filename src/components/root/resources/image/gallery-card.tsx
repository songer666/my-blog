import React from 'react';
import Link from 'next/link';
import { ImageIcon, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryCardProps {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverUrl?: string | null; // Signed URL passed from server
  itemCount: number;
  createdAt: Date | string;
  index: number;
}

const styles = {
  wrapper: 'group block relative h-full',
  container: `relative h-full aspect-[3/4] overflow-hidden rounded-lg
    border border-border/60
    shadow-sm
    transition-all duration-300
    hover:border-primary/50
    hover:shadow-lg
    hover:-translate-y-1`.trim(),
  image: 'absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:grayscale',
  overlay: 'absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-all duration-300',
  countBadge: 'absolute top-3 right-3 bg-white/90 dark:bg-violet-500/90 backdrop-blur-sm text-gray-800 dark:text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-lg z-20',
  content: 'absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col gap-1.5',
  title: 'text-white font-semibold text-base line-clamp-1 drop-shadow-lg transition-all duration-300',
  description: 'text-white/95 dark:text-white/90 text-xs leading-relaxed line-clamp-3 drop-shadow-md opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-16 transition-all duration-300',
};


export function GalleryCard({
  id,
  title,
  slug,
  description,
  coverUrl,
  itemCount,
  createdAt,
}: GalleryCardProps) {
  return (
    <Link href={`/resources/image/${slug}`} className={styles.wrapper}>
      <div className={styles.container}>
        {/* 背景图片 */}
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className={styles.image}
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
            <ImageIcon className="w-16 h-16 opacity-20" />
          </div>
        )}
        
        {/* 渐变蒙版 */}
        <div className={styles.overlay} />
        
        {/* 右上角数字徽章 */}
        <div className={styles.countBadge}>
          {itemCount}
        </div>
        
        {/* 信息层 */}
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
