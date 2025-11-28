import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/shadcn/ui/badge';
import { Calendar, Music, Disc, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicCardProps {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  coverUrl?: string | null; // Base64 or Signed URL
  itemCount: number;
  keywords?: string[] | null;
  tags?: string[] | null;
  createdAt: Date | string;
  index: number;
}

const styles = {
  wrapper: 'group block relative h-full',
  container: `relative h-full min-h-[160px] p-3
    border border-border/60 rounded-lg overflow-visible
    bg-card text-card-foreground
    shadow-sm
    transition-all duration-300
    hover:shadow-md`.trim(),
  // 左上角封面 - 探出卡片，无圆角
  coverSection: `absolute left-0 top-0 w-24 h-20 shrink-0 overflow-hidden bg-muted shadow-md z-10
    transform translate-x-[14px] translate-y-[-12px]`,
  image: 'object-cover w-full h-full',
  
  // 标题和日期 - 绝对定位在图片右边
  titleSection: 'absolute left-[130px] top-3 right-3',
  title: `text-base font-semibold tracking-tight line-clamp-1 text-foreground
    group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-all duration-300`,
  date: 'text-xs text-muted-foreground mt-0.5',
  
  // 描述 - 绝对定位在图片下面
  description: 'absolute left-3 top-[80px] right-3 text-xs text-foreground line-clamp-2 font-sans',
  
  // 底部 - 绝对定位到底部
  footer: 'absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-muted-foreground',
  tags: 'text-xs text-muted-foreground truncate flex-1',
  stats: 'flex items-center gap-1 shrink-0',
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function isBase64(str: string) {
  return str.startsWith('data:image');
}

export function MusicCard({
  id,
  title,
  slug,
  description,
  coverUrl,
  itemCount,
  keywords,
  tags,
  createdAt,
}: MusicCardProps) {
  const displayTags = [...(keywords || []), ...(tags || [])].slice(0, 3).join(' / ');

  return (
    <Link href={`/root/resources/music/${slug}`} className={styles.wrapper}>
      <div className={styles.container}>
        {/* 左上角封面 - 探出卡片 */}
        <div className={styles.coverSection}>
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Disc className="w-8 h-8 opacity-20" />
            </div>
          )}
        </div>
        
        {/* 标题和日期 - 绝对定位在图片右边 */}
        <div className={styles.titleSection}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.date}>{formatDate(createdAt)}</div>
        </div>
        
        {/* 描述 - 绝对定位在图片下面 */}
        {description && (
          <p className={styles.description}>{description}</p>
        )}
        
        {/* 底部 - 绝对定位到底部 */}
        <div className={styles.footer}>
          <div className={styles.tags}>{displayTags || '未分类'}</div>
          <div className={styles.stats}>
            <Music className="w-3 h-3" />
            <span>{itemCount}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
