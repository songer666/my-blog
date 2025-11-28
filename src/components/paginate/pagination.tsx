import React from 'react';
import Link from 'next/link';
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

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  // 如果只有一页或没有页面，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  // 构建URL查询参数
  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // 添加其他查询参数
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    
    // 添加页码参数
    params.set('page', page.toString());
    
    return `${baseUrl}?${params.toString()}`;
  };

  const showPrevious = currentPage > 1;
  const showNext = currentPage < totalPages;

  return (
    <ShadcnPagination className={styles.container}>
      <PaginationContent>
        {showPrevious && (
          <PaginationItem>
            <PaginationPrevious href={buildUrl(currentPage - 1)} />
          </PaginationItem>
        )}
        
        {showNext && (
          <PaginationItem>
            <PaginationNext href={buildUrl(currentPage + 1)} />
          </PaginationItem>
        )}
      </PaginationContent>
    </ShadcnPagination>
  );
}
