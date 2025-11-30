import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/shadcn/ui/badge';
import { Calendar, Code2, FileCode, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeCardProps {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  keywords?: string[] | null;
  itemCount: number;
  createdAt: Date | string;
  index: number;
}

const styles = {
  wrapper: 'group block relative h-full',
  container: `flex flex-col h-full relative
    border border-border/60 rounded-lg overflow-hidden
    bg-card text-card-foreground
    shadow-sm
    transition-all duration-300
    hover:border-violet-500/50 dark:hover:border-violet-400/50
    hover:shadow-md
    hover:-translate-y-1`.trim(),
  header: 'p-3 flex flex-col gap-2',
  title: `text-base font-semibold tracking-tight line-clamp-1
    group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:underline transition-all duration-300`,
  content: 'flex-1 px-3 pb-2 flex flex-col gap-2',
  description: 'text-xs text-muted-foreground line-clamp-2',
  keywords: 'flex flex-wrap gap-1.5',
  keyword: 'text-[9px] px-1.5 h-5 font-normal bg-secondary text-secondary-foreground hover:bg-secondary/80',
  footer: 'px-3 py-2 border-t border-border/40 flex items-center gap-1.5 text-xs text-muted-foreground',
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function CodeCard({
  id,
  title,
  slug,
  description,
  keywords,
  itemCount,
  createdAt,
}: CodeCardProps) {
  return (
    <Link href={`/resources/code/${slug}`} className={styles.wrapper}>
      <div className={styles.container}>
        {/* Header: 标题 */}
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        {/* Content: 描述和关键词 */}
        <div className={styles.content}>
          {description && (
            <p className={styles.description}>{description}</p>
          )}
          
          {keywords && keywords.length > 0 && (
            <div className={styles.keywords}>
              {keywords.slice(0, 3).map((keyword, idx) => (
                <Badge key={`${id}-k-${idx}`} variant="secondary" className={styles.keyword}>
                  {keyword}
                </Badge>
              ))}
              {keywords.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">+{keywords.length - 3}</span>
              )}
            </div>
          )}
        </div>
        
        {/* Footer: 时间 */}
        <div className={styles.footer}>
          <Calendar className="w-3 h-3" />
          <time>{formatDate(createdAt)}</time>
        </div>
      </div>
    </Link>
  );
}
