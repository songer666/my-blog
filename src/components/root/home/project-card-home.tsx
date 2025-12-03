"use client";

import React from 'react';
import Link from 'next/link';
import { Calendar, Github, ExternalLink } from 'lucide-react';

interface ProjectCardHomeProps {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  createdAt: Date;
}

const styles = {
  container: `relative flex flex-col h-full rounded-xl overflow-hidden
    bg-white dark:bg-black border border-black dark:border-white/20
    transition-all duration-300
    hover:shadow-[0_0_20px_rgba(139,92,246,0.15),0_0_40px_rgba(139,92,246,0.1),0_0_60px_rgba(139,92,246,0.05)]
    dark:hover:shadow-[0_0_20px_rgba(167,139,250,0.2),0_0_40px_rgba(167,139,250,0.15),0_0_60px_rgba(167,139,250,0.1)]
    hover:-translate-y-1`,
  
  // 内容区域（在上面）
  content: 'flex flex-col gap-3 p-6 flex-grow',
  titleLink: 'block',
  title: `font-display text-2xl font-semibold text-foreground
    line-clamp-2 transition-colors duration-300
    hover:text-violet-600 dark:hover:text-violet-400`,
  description: 'font-sans text-sm text-muted-foreground line-clamp-3',
  
  // 操作按钮
  actions: 'flex items-center gap-2 mt-4',
  actionButton: `flex items-center gap-2 px-3 py-1.5 rounded-lg
    text-xs font-medium
    border border-border/50
    hover:bg-muted transition-colors duration-200`,
  
  // 底部信息
  footer: 'flex items-center gap-2 text-xs text-muted-foreground pt-4 border-t border-border/50',
  date: 'flex items-center gap-1.5',
  
  // 图片区域（在下面）
  imageContainer: 'relative w-full h-48 overflow-hidden bg-muted border-t border-border/50',
  image: 'absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110',
  imagePlaceholder: 'w-full h-full flex items-center justify-center text-muted-foreground',
};

export function ProjectCardHome({ 
  id, 
  title, 
  description, 
  slug, 
  image,
  githubUrl,
  demoUrl,
  createdAt 
}: ProjectCardHomeProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <article className={styles.container}>
      {/* 内容区域 */}
      <div className={styles.content}>
        <Link href={`/projects/${slug}`} className={styles.titleLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>
        
        <p className={styles.description}>{description}</p>
        
        {/* 操作按钮 */}
        {(githubUrl || demoUrl) && (
          <div className={styles.actions}>
            {githubUrl && (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionButton}
                onClick={(e) => e.stopPropagation()}
              >
                <Github className="w-3.5 h-3.5" />
                <span>源码</span>
              </a>
            )}
            {demoUrl && (
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionButton}
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>演示</span>
              </a>
            )}
          </div>
        )}
        
        {/* 底部日期 */}
        <div className={styles.footer}>
          <div className={styles.date}>
            <Calendar className="w-3.5 h-3.5" />
            <time>{formattedDate}</time>
          </div>
        </div>
      </div>
      
      {/* 图片区域 */}
      <Link href={`/projects/${slug}`} className="block group">
        <div className={styles.imageContainer}>
          {image ? (
            <img
              src={image}
              alt={title}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className="text-4xl">🚀</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
