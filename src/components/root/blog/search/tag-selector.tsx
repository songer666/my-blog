import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/shadcn/ui/badge';

interface Tag {
  id: string;
  name: string;
  postCount: number;
}

interface TagSelectorProps {
  tags: Tag[];
  currentTag?: string;
  baseUrl: string;
  searchParams?: Record<string, string>;
  totalPosts: number; // 文章总数
}

const styles = {
  container: '',
  tagsWrapper: 'flex flex-wrap gap-2',
  badge: (isActive: boolean) =>
    isActive
      ? `h-8 flex items-center px-1 pl-3 rounded-lg cursor-pointer 
        border border-foreground/20 dark:border-purple-600/50 
        bg-foreground dark:bg-purple-950/20 
        text-background dark:text-purple-400 text-sm 
        transition-all duration-200 font-sans font-semibold`.trim()
      : `h-8 flex items-center px-1 pl-3 rounded-lg cursor-pointer 
        border border-border/60 
        hover:border-border dark:hover:border-purple-600/30 
        hover:bg-secondary dark:hover:bg-purple-950/10 
        hover:text-foreground dark:hover:text-purple-400 
        text-sm transition-all duration-200 font-sans`.trim(),
  count: (isActive: boolean) =>
    isActive
      ? `ml-2 text-xs border border-background/20 dark:border-purple-600/40 
        bg-background dark:bg-purple-900/30 
        text-foreground dark:text-purple-400 rounded-md 
        h-6 min-w-[1.5rem] font-bold 
        flex items-center justify-center`.trim()
      : `ml-2 text-xs border border-border/60 dark:border-border 
        bg-background
        rounded-md h-6 min-w-[1.5rem] font-medium 
        flex items-center justify-center`.trim(),
};

export function TagSelector({ tags, currentTag, baseUrl, searchParams = {}, totalPosts }: TagSelectorProps) {
  // 构建URL
  const buildUrl = (tagName?: string) => {
    const params = new URLSearchParams();
    
    // 添加其他查询参数（排除tag和page）
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'tag' && key !== 'page') {
        params.set(key, value);
      }
    });
    
    // 添加标签参数（如果有）
    if (tagName) {
      params.set('tag', tagName);
    }
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.tagsWrapper}>
        {/* 全部标签按钮（显示文章总数） */}
        <Link href={buildUrl()}>
          <button className={styles.badge(!currentTag)}>
            <span>全部</span>
            <span className={styles.count(!currentTag)}>{totalPosts}</span>
          </button>
        </Link>

        {/* 各个标签按钮 */}
        {tags.map((tag) => (
          <Link key={tag.id} href={buildUrl(tag.name)}>
            <button className={styles.badge(currentTag === tag.name)}>
              <span>{tag.name}</span>
              <span className={styles.count(currentTag === tag.name)}>{tag.postCount}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
