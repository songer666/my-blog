import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/shadcn/ui/badge';

interface BlogCardProps {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  keyWords?: string | null;
  createdAt: Date;
}

const styles = {
  link: 'group block h-full',
  container: `flex flex-col h-full border-r border-b border-border/60 
    hover:border-purple-300/50 dark:hover:border-purple-600/30 
    hover:bg-purple-50/20 dark:hover:bg-purple-950/5 
    transition-all duration-300`.trim(),
  imageContainer: 'relative w-full h-48 overflow-hidden',
  image: 'object-cover transition-transform duration-300 group-hover:scale-105',
  keywordsWrapper: `absolute top-2 right-2 flex flex-wrap gap-1.5 
    max-w-[calc(100%-1rem)] justify-end`.trim(),
  keyword: `text-[10px] font-sans 
    bg-gray-100/90 dark:bg-purple-600/60 
    text-gray-700 dark:text-white backdrop-blur-xl 
    px-2 py-1 rounded-md shadow-sm 
    border border-gray-200/60 dark:border-white/20`.trim(),
  content: 'p-6 flex flex-col gap-2 flex-grow',
  title: `text-xl font-semibold text-card-foreground 
    dark:group-hover:text-purple-400 
    group-hover:underline underline-offset-4 font-sans 
    transition-colors duration-300`.trim(),
  description: 'text-muted-foreground/80 text-sm font-sans line-clamp-3',
  date: 'block text-sm font-medium text-muted-foreground/70 font-sans mt-auto pt-4',
};

export function BlogCard({ id, title, description, slug, image, keyWords, createdAt }: BlogCardProps) {
  // 将 keyWords 字符串分割成数组
  const keywordArray = keyWords ? keyWords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];
  
  return (
    <Link href={`/root/blog/${slug}`} className={styles.link}>
      <div className={styles.container}>
        {image && (
          <div className={styles.imageContainer}>
            <Image
              src={image}
              alt={title}
              fill
              className={styles.image}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
        
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          
          <time className={styles.date}>
            {new Date(createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        </div>
      </div>
    </Link>
  );
}
