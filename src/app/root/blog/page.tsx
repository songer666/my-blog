import React from 'react';
import { caller } from '@/components/trpc/server';
import { TagSelector } from '@/components/root/blog/search/tag-selector';
import { SearchBox } from '@/components/root/blog/search/search-box';
import { BlogList } from '@/components/root/blog/card/blog-list';
import { Pagination } from '@/components/paginate/pagination';
import { generateBlogListMetadata } from './metadata';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

// 页面样式（增加 padding-top 避免与固定 navbar 重叠）
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
    subtitle: 'text-sm text-muted-foreground/80 font-sans flex items-center gap-1.5',
    description: 'text-muted-foreground text-sm md:text-base font-sans text-left',
  },
  searchContainer: 'max-w-6xl px-6',
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    keyword?: string;
    tag?: string;
  }>;
}

// 生成页面 metadata
export async function generateMetadata(
  props: any,
  parent: any
) {
  return await generateBlogListMetadata(parent);
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = params.page ? parseInt(params.page) : 1;
  const keyword = params.keyword || '';
  const tag = params.tag || '';

  // 获取博客文章列表
  const postsResponse = await caller.post.getPublicPosts({
    page: currentPage,
    limit: 6,
    keyword: keyword || undefined,
    tagName: tag || undefined,
  });

  // 获取标签列表及文章数量
  const tagsResponse = await caller.tag.getPublicTagsWithCount();

  // 获取所有文章的总数（未筛选，用于"全部"标签）
  const allPostsResponse = await caller.post.getPublicPosts({
    page: 1,
    limit: 1,
  });

  const posts = postsResponse.data?.posts || [];
  const total = postsResponse.data?.total || 0;
  const totalPages = postsResponse.data?.totalPages || 0;
  const tags = tagsResponse.data || [];
  const totalAllPosts = allPostsResponse.data?.total || 0;

  // 构建搜索参数（用于分页和标签链接）
  const searchParamsObj: Record<string, string> = {};
  if (keyword) searchParamsObj.keyword = keyword;
  if (tag) searchParamsObj.tag = tag;

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
              tags={tags}
              currentTag={tag}
              baseUrl="/root/blog"
              searchParams={searchParamsObj}
              totalPosts={totalAllPosts}
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
          <BlogList posts={posts} />
        </div>
      </BlurFade>

      {/* 分页 */}
      <BlurFade delay={0.4} inView>
        <div className={pageStyles.innerContainer}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            baseUrl="/root/blog"
            searchParams={searchParamsObj}
          />
        </div>
      </BlurFade>
    </div>
  );
}