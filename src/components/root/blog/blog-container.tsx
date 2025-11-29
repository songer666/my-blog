'use client';

import React, { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { BlogList } from './card/blog-list';
import { TagSelector } from './search/tag-selector';
import { SearchBox } from './search/search-box';
import { Pagination } from '@/components/paginate/pagination';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

interface Post {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  keyWords?: string | null;
  createdAt: Date;
  tags?: Array<{ id: string; name: string }>;
}

interface Tag {
  id: string;
  name: string;
  postCount: number;
}

interface BlogContainerProps {
  allPosts: Post[];
  allTags: Tag[];
}

const POSTS_PER_PAGE = 6;

const pageStyles = {
  container: 'w-full pt-20 sm:pt-24',
  subContainer: 'p-6 max-w-7xl mx-auto flex flex-col gap-6',
  dividerContainer: 'relative w-full h-px max-w-7xl mx-auto mt-8 mb-0 z-20 overflow-visible',
  divider: 'absolute inset-0 bg-border hover:h-[2px] hover:-translate-y-[0.5px] transition-all duration-200',
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  header: {
    container: 'max-w-6xl px-6 flex flex-col gap-2',
    title: `text-4xl md:text-4xl font-semibold tracking-tighter font-sans 
      text-violet-500 dark:text-violet-500 
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`.trim(),
    description: 'text-muted-foreground text-sm md:text-base font-sans text-left',
  },
  searchContainer: 'max-w-6xl px-6',
};

export function BlogContainer({ allPosts, allTags }: BlogContainerProps) {
  const searchParams = useSearchParams();
  
  // 从URL获取参数
  const currentPage = parseInt(searchParams.get('page') || '1');
  const keyword = searchParams.get('keyword') || '';
  const tag = searchParams.get('tag') || '';

  // 客户端筛选逻辑
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // 标签筛选
    if (tag) {
      filtered = filtered.filter((post) =>
        post.tags?.some((t) => t.name === tag)
      );
    }

    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(lowerKeyword) ||
          post.description.toLowerCase().includes(lowerKeyword) ||
          post.keyWords?.toLowerCase().includes(lowerKeyword)
      );
    }

    return filtered;
  }, [allPosts, tag, keyword]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return filteredPosts.slice(startIndex, endIndex);
  }, [filteredPosts, currentPage]);

  return (
    <div className={pageStyles.container}>
      {/* 页面标题和过滤器 */}
      <BlurFade delay={0.1} inView>
        <div className={pageStyles.subContainer}>
          <div className={pageStyles.header.container}>
            <h1 className={pageStyles.header.title}>博客</h1>
            <p className={pageStyles.header.description}>
              技术与灵感的交响乐章
              {keyword && ` · 搜索: "${keyword}"`}
              {tag && ` · 标签: ${tag}`}
            </p>
          </div>

          {/* 搜索框 */}
          <div className={pageStyles.searchContainer}>
            <SearchBox currentKeyword={keyword} baseUrl="/root/blog" />
          </div>

          {/* 标签选择器 */}
          <div className={pageStyles.searchContainer}>
            <TagSelector
              tags={allTags}
              currentTag={tag}
              baseUrl="/root/blog"
              searchParams={{ keyword, tag }}
              totalPosts={allPosts.length}
            />
          </div>
        </div>
      </BlurFade>

      {/* BorderBeam 分隔线 */}
      <div className={pageStyles.dividerContainer}>
        <div className={pageStyles.divider} />
        <BorderBeam
          size={200}
          duration={8}
          delay={0}
          colorFrom="#a855f7"
          colorTo="#ec4899"
          borderWidth={1}
        />
      </div>

      {/* 博客列表 */}
      <BlurFade delay={0.3} inView>
        <div className={pageStyles.innerContainer}>
          <BlogList posts={paginatedPosts} />
        </div>
      </BlurFade>

      {/* 分页 */}
      <BlurFade delay={0.4} inView>
        <div className={pageStyles.innerContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/root/blog"
          />
        </div>
      </BlurFade>
    </div>
  );
}
