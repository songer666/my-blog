import React from 'react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Calendar, Github, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/shadcn/ui/tooltip';

interface ProjectHeaderProps {
  title: string;
  description: string;
  image?: string | null;
  keyWords?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  showDivider?: boolean;
}

const styles = {
  header: 'mb-8',
  imageContainer: 'relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden',
  image: 'object-cover',
  title: `font-display text-3xl md:text-4xl font-medium mb-4
    text-foreground dark:text-purple-400
    drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_4px_16px_rgba(168,85,247,0.6)]`.trim(),
  description: 'font-sans text-xl text-muted-foreground/80 mb-6',
  meta: {
    container: `flex flex-wrap items-center gap-4 
      text-sm text-muted-foreground mb-6`.trim(),
    item: 'flex items-center gap-1',
    icon: 'w-4 h-4',
  },
  keywordsWrapper: 'flex flex-wrap gap-2 ml-4',
  keyword: `text-xs
    bg-secondary dark:bg-purple-600/60
    text-foreground dark:text-white
    px-3 py-1.5 rounded-md
    border border-border dark:border-white/20
    hover:bg-secondary/80 dark:hover:bg-purple-600/80
    transition-colors cursor-help`.trim(),
  links: {
    container: 'flex gap-3 mb-6',
    link: `flex items-center gap-2 px-4 py-2 rounded-lg
      bg-secondary dark:bg-purple-900/30
      text-foreground dark:text-purple-300
      hover:bg-secondary/80 dark:hover:bg-purple-900/50
      border border-border dark:border-purple-600/30
      transition-colors`.trim(),
    icon: 'w-4 h-4',
  },
  divider: 'mt-8 border-t border-border',
};

export function ProjectHeader({ 
  title, 
  description, 
  image, 
  keyWords, 
  githubUrl, 
  demoUrl, 
  createdAt,
  showDivider = true 
}: ProjectHeaderProps) {
  // 将 keyWords 字符串分割成数组
  const keywordArray = keyWords ? keyWords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  
  return (
    <header className={styles.header}>
      {/* 标题 */}
      <h1 className={styles.title}>{title}</h1>

      {/* 描述 */}
      <p className={styles.description}>{description}</p>

      {/* 外部链接 */}
      {(githubUrl || demoUrl) && (
        <div className={styles.links.container}>
          {githubUrl && (
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.links.link}
            >
              <Github className={styles.links.icon} />
              GitHub
            </Link>
          )}
          {demoUrl && (
            <Link
              href={demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.links.link}
            >
              <ExternalLink className={styles.links.icon} />
              在线演示
            </Link>
          )}
        </div>
      )}

      {/* 元信息和Keywords */}
      <div className={styles.meta.container}>
        <div className={styles.meta.item}>
          <Calendar className={styles.meta.icon} />
          <span>发布于 {new Date(createdAt).toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
        
        {/* Keywords badges 显示在时间后面 */}
        {keywordArray.length > 0 && (
          <TooltipProvider>
            <div className={styles.keywordsWrapper}>
              {keywordArray.map((keyword, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <Badge className={styles.keyword}>
                      #{keyword}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{keyword}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}
      </div>

      {/* 分割线 */}
      {showDivider && <hr className={styles.divider} />}
    </header>
  );
}

