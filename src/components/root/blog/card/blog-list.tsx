import React from 'react';
import { BlogCard } from './blog-card';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

interface Post {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  keyWords?: string | null;
  createdAt: Date;
}

interface BlogListProps {
  posts: Post[];
}

const styles = {
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-l border-border',
};

export function BlogList({ posts }: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className={styles.empty.container}>
        <p className={styles.empty.title}>暂无博客文章</p>
        <p className={styles.empty.subtitle}>敬请期待更多精彩内容</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {posts.map((post, index) => (
        <BlurFade key={post.id} delay={0.15 + index * 0.1} inView>
          <BlogCard {...post} />
        </BlurFade>
      ))}
    </div>
  );
}
