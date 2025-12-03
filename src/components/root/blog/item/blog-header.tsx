import React from 'react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

interface BlogHeaderProps {
  title: string;
  description: string;
  image?: string | null;
  keyWords?: string | null;
  createdAt: Date;
  updatedAt: Date;
  showDivider?: boolean;
  /** 统计组件插槽 */
  statsSlot?: React.ReactNode;
}

const styles = {
  header: 'mb-8',
  imageContainer: 'relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden',
  image: 'object-cover',
  keywordsWrapper: `absolute top-4 right-4 flex flex-wrap gap-2 
    max-w-[calc(100%-2rem)] justify-end`.trim(),
  keyword: `text-xs font-sans 
    bg-gray-100/90 dark:bg-purple-600/60 
    text-gray-700 dark:text-white backdrop-blur-xl 
    px-3 py-1.5 rounded-md shadow-sm 
    border border-gray-200/60 dark:border-white/20`.trim(),
  title: `font-display text-3xl md:text-4xl font-bold mb-4 
    text-foreground dark:text-purple-400 
    drop-shadow-[0_2px_4px_rgba(168,85,247,0.15)]`.trim(),
  description: 'font-sans text-xl text-muted-foreground/80 mb-6',
  meta: {
    container: `flex flex-wrap items-center gap-4 
      text-sm text-muted-foreground mb-6 font-sans`.trim(),
    item: 'flex items-center gap-1',
    icon: 'w-4 h-4',
  },
  divider: 'mt-8 border-t border-border',
};

export function BlogHeader({ title, description, image, keyWords, createdAt, updatedAt, showDivider = true, statsSlot }: BlogHeaderProps) {
  // 将 keyWords 字符串分割成数组
  const keywordArray = keyWords ? keyWords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  return (
    <header className={styles.header}>
      {/* 封面图片 */}
      {image && (
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={title}
            fill
            className={styles.image}
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
          
          {/* Keywords badges 显示在图片右上角 */}
          {keywordArray.length > 0 && (
            <div className={styles.keywordsWrapper}>
              {keywordArray.map((keyword, index) => (
                <Badge key={index} className={styles.keyword}>
                  #{keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 标题 */}
      <h1 className={styles.title}>{title}</h1>

      {/* 描述 */}
      <p className={styles.description}>{description}</p>

      {/* 元信息 */}
      <div className={styles.meta.container}>
        <div className={styles.meta.item}>
          <Calendar className={styles.meta.icon} />
          <span>发布于 {new Date(createdAt).toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        {/* 统计信息插槽 */}
        {statsSlot}
      </div>

      {/* 分割线 */}
      {showDivider && <hr className={styles.divider} />}
    </header>
  );
}
