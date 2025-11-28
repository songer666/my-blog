"use client";

import { BlogTable } from './blog-table';
import { PostList } from '@/server/types/blog-type';
import { TRPCReactProvider } from '@/components/trpc/client';

interface BlogTableWrapperProps {
  posts: PostList;
}

export function BlogTableWrapper({ posts }: BlogTableWrapperProps) {
  return (
    <TRPCReactProvider>
      <BlogTable posts={posts} />
    </TRPCReactProvider>
  );
}
