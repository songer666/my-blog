import React from 'react';
import { caller } from '@/components/trpc/server';
import { generateBlogListMetadata } from './metadata';
import { BlogContainer } from '@/components/root/blog/blog-container';

// 生成页面 metadata
export async function generateMetadata(
  props: any,
  parent: any
) {
  return await generateBlogListMetadata(parent);
}
// 强制静态生成（SSG）
export const dynamic = 'force-static';

export default async function BlogPage() {
  // 一次性获取所有博客文章（不分页）
  const allPostsResponse = await caller.post.getPublicPosts({
    page: 1,
    limit: 1000, // 获取所有文章
  });

  // 获取所有标签
  const tagsResponse = await caller.tag.getPublicTagsWithCount();

  const allPosts = allPostsResponse.data?.posts || [];
  const allTags = tagsResponse.data || [];

  // 将所有数据传递给客户端组件，由客户端处理筛选和分页
  return <BlogContainer allPosts={allPosts} allTags={allTags} />;
}