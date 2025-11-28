import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { BlogTableWrapper } from '@/components/admin/blog/blog-table-wrapper';
import { PostList } from '@/server/types/blog-type';

// Admin 页面需要认证，保持动态渲染

export default async function BlogPage() {
  const queryClient = getQueryClient();
  // 获取所有文章数据
  const postsResponse = await queryClient.fetchQuery(trpc.post.getAll.queryOptions());
  const posts: PostList = postsResponse.data || [];

  return (
    <div className="w-full mx-auto py-6">
      <BlogTableWrapper posts={posts} />
    </div>
  );
}
