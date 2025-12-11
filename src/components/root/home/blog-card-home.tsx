import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar } from 'lucide-react';

interface BlogCardHomeProps {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  createdAt: Date;
  index?: number; // 用于判断是否优先加载
}

const styles = {
  link: 'group block h-full',
  container: `relative flex flex-col h-full rounded-xl overflow-hidden
    bg-white dark:bg-black border border-black dark:border-white/20
    transition-all duration-300
    hover:shadow-[0_0_20px_rgba(139,92,246,0.15),0_0_40px_rgba(139,92,246,0.1),0_0_60px_rgba(139,92,246,0.05)]
    dark:hover:shadow-[0_0_20px_rgba(167,139,250,0.2),0_0_40px_rgba(167,139,250,0.15),0_0_60px_rgba(167,139,250,0.1)]
    hover:-translate-y-1`,
  
  // 图片区域（在上面）
  imageContainer: 'relative w-full h-48 overflow-hidden bg-muted',
  image: 'object-cover transition-transform duration-500 group-hover:scale-110',
  imagePlaceholder: 'w-full h-full flex items-center justify-center text-muted-foreground',
  
  // 内容区域
  content: 'flex flex-col gap-3 p-6 flex-grow',
  title: `font-display text-xl font-semibold text-foreground
    line-clamp-2 transition-colors duration-300
    group-hover:text-violet-600 dark:group-hover:text-violet-400`,
  description: 'font-sans text-sm text-muted-foreground line-clamp-3',
  
  // 底部信息
  footer: 'flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-4 border-t border-border/50',
  date: 'flex items-center gap-1.5',
};

export function BlogCardHome({ 
  id, 
  title, 
  description, 
  slug, 
  image, 
  createdAt,
  index = 0
}: BlogCardHomeProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Link href={`/blog/${slug}`} className={styles.link}>
      <article className={styles.container}>
        {/* 图片区域 */}
        <div className={styles.imageContainer}>
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className={styles.image}
              sizes="(max-width: 640px) 100vw, 33vw"
              priority={index < 2} // 只有前2张图片优先加载
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className="text-4xl">📝</span>
            </div>
          )}
        </div>
        
        {/* 内容区域 */}
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          
          {/* 底部日期 */}
          <div className={styles.footer}>
            <div className={styles.date}>
              <Calendar className="w-3.5 h-3.5" />
              <time>{formattedDate}</time>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
