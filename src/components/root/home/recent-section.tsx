"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

interface RecentSectionProps {
  title: string;
  moreText: string;
  moreLink: string;
  children: React.ReactNode;
}

const styles = {
  container: 'w-full py-16 sm:py-20 lg:py-24',
  wrapper: 'max-w-7xl mx-auto px-6 sm:px-8',
  
  // 标题区域
  header: {
    container: 'flex items-center justify-between mb-8 sm:mb-12',
    title: `font-display text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tighter
      text-violet-500 dark:text-violet-500
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`,
    moreLink: `group flex items-center gap-2 
      font-sans text-base sm:text-lg text-muted-foreground
      hover:text-purple-600 dark:hover:text-purple-400
      transition-all duration-300`,
    arrow: `w-5 h-5 transition-transform duration-300 
      group-hover:translate-x-1`,
  },
  
  // 内容区域
  content: 'w-full',
};

export function RecentSection({ title, moreText, moreLink, children }: RecentSectionProps) {
  return (
    <section className={styles.container}>
      <div className={styles.wrapper}>
        <BlurFade delay={0.1} inView>
          <div className={styles.header.container}>
            {/* 左侧标题 */}
            <h2 className={styles.header.title}>
              {title}
            </h2>
            
            {/* 右侧"更多"链接 */}
            <Link href={moreLink} className={styles.header.moreLink}>
              <span>{moreText}</span>
              <ArrowRight className={styles.header.arrow} />
            </Link>
          </div>
        </BlurFade>
        
        {/* 内容区域 */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </section>
  );
}
