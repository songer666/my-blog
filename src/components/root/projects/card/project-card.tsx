import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Github, ExternalLink, Calendar } from 'lucide-react';
import { ShineBorder } from '@/components/shadcn/ui/shine-border';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  keyWords?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  createdAt: Date;
  index: number;
}

const styles = {
  wrapper: 'group block relative',
  container: `flex flex-col sm:flex-row gap-0 relative
    border border-border/60 rounded overflow-hidden
    bg-gray-100
    shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),inset_0_-1px_2px_rgba(0,0,0,0.06)]
    dark:bg-background
    dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),inset_0_-1px_2px_rgba(255,255,255,0.03)]
    transition-all duration-300
    hover:border-violet-300/50 dark:hover:border-violet-600/30
    hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.08),inset_0_-2px_4px_rgba(0,0,0,0.08)]
    dark:hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),inset_0_-2px_4px_rgba(255,255,255,0.05)]
    hover:scale-[1.02] hover:-translate-y-0.5`.trim(),
  imageWrapper: (isEven: boolean) => `
    relative w-full sm:w-2/5 h-64 sm:h-auto
    flex-shrink-0 overflow-hidden
    ${isEven ? 'sm:order-1' : 'sm:order-2'}
  `.trim(),
  image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
  contentWrapper: (isEven: boolean) => `
    flex flex-col p-6 lg:p-8 w-full sm:w-3/5
    ${isEven ? 'sm:order-2' : 'sm:order-1'}
  `.trim(),
  titleLink: 'block',
  title: `text-2xl lg:text-3xl font-medium mb-4
    text-foreground dark:text-foreground
    transition-all duration-300
    hover:drop-shadow-[0_2px_8px_rgba(139,92,246,0.4)]
    dark:hover:drop-shadow-[0_2px_8px_rgba(167,139,250,0.5)]`.trim(),
  meta: 'flex items-center justify-between mb-4 pb-4 border-b border-border/40',
  date: 'flex items-center gap-2 text-sm text-muted-foreground',
  actions: 'flex items-center gap-2',
  actionButton: 'hover:text-violet-600 dark:hover:text-violet-400',
  description: 'text-muted-foreground text-sm lg:text-base font-sans line-clamp-3 mb-4',
  keywords: 'flex flex-wrap gap-2',
  keyword: `text-[10px] font-sans
    bg-black/[0.7] dark:bg-purple-600/60
    text-white dark:text-white
    px-2 py-1 rounded-md
    border border-gray-200/60 dark:border-white/20`.trim(),
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function isBase64Image(src: string): boolean {
  return src.startsWith('data:image/');
}

export function ProjectCard({ 
  id, 
  title, 
  description, 
  slug, 
  image, 
  keyWords, 
  githubUrl, 
  demoUrl, 
  createdAt,
  index
}: ProjectCardProps) {
  const keywordArray = keyWords ? keyWords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  const isEven = index % 2 === 0;
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {/* Shine Border - 暗色模式下显示 */}
        <ShineBorder 
          className="hidden dark:block"
          shineColor={['#a855f7', '#ec4899', '#8b5cf6']}
          duration={10}
          borderWidth={1}
        />
        {/* 图片部分 */}
        <Link href={`/projects/${slug}`} className={styles.imageWrapper(isEven)}>
          {image && (
            <>
              {isBase64Image(image) ? (
                <img
                  src={image}
                  alt={title}
                  className={styles.image}
                />
              ) : (
                <Image
                  src={image}
                  alt={title}
                  fill
                  className={styles.image}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 40vw"
                />
              )}
            </>
          )}
        </Link>
        
        {/* 内容部分 */}
        <div className={styles.contentWrapper(isEven)}>
          {/* 标题 */}
          <Link href={`/projects/${slug}`} className={styles.titleLink}>
            <h3 className={styles.title}>{title}</h3>
          </Link>
          
          {/* 时间和链接按钮 */}
          <div className={styles.meta}>
            <div className={styles.date}>
              <Calendar className="w-4 h-4" />
              <time>{formatDate(createdAt)}</time>
            </div>
            
            <div className={styles.actions}>
              {githubUrl && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  asChild
                >
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionButton}
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {demoUrl && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  asChild
                >
                  <a
                    href={demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionButton}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          
          {/* 描述 */}
          <p className={styles.description}>{description}</p>
          
          {/* Keywords */}
          {keywordArray.length > 0 && (
            <div className={styles.keywords}>
              {keywordArray.map((keyword, idx) => (
                <Badge key={`${id}-keyword-${idx}`} className={styles.keyword}>
                  #{keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

