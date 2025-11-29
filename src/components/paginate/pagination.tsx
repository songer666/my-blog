'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaginationProps } from './type';
import {
  Pagination as ShadcnPagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from '@/components/shadcn/ui/pagination';

const styles = {
  container: 'my-8',
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
    <ShadcnPagination className={styles.container}>
      <PaginationContent>
        {showPrevious && (
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => handlePageChange(currentPage - 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
        
        {showNext && (
          <PaginationItem>
            <PaginationNext 
              onClick={() => handlePageChange(currentPage + 1)}
              className="cursor-pointer"
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
}
