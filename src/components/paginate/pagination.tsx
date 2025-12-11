'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaginationProps } from './type';
import { Button } from '@/components/shadcn/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const styles = {
  container: 'my-8 flex justify-center gap-4',
  button: `gap-2 font-sans cursor-pointer
    text-purple-600 hover:text-purple-700 
    dark:text-purple-400 dark:hover:text-purple-300 
    border-purple-300/50 dark:border-purple-600/30 
    hover:bg-purple-50/30 dark:hover:bg-purple-950/10 
    transition-all duration-200`,
  icon: 'w-4 h-4',
};

export function Pagination({ currentPage, totalPages, baseUrl }: Omit<PaginationProps, 'searchParams'>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 如果只有一页或没有页面，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 构建URL查询参数
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 更新页码参数
    params.set('page', page.toString());
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    const url = buildUrl(page);
    router.push(url);
    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showPrevious = currentPage > 1;
  const showNext = currentPage < totalPages;

  return (
    <nav className={styles.container}>
      {showPrevious && (
        <Button 
          variant="ghost" 
          className={styles.button}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ArrowLeft className={styles.icon} />
          新鲜的博客
        </Button>
      )}
      
      {showNext && (
        <Button 
          variant="ghost" 
          className={styles.button}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          老旧的博客
          <ArrowRight className={styles.icon} />
        </Button>
      )}
    </nav>
  );
}
