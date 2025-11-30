import React from 'react';
import { BlogCardHome } from './blog-card-home';
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

interface RecentBlogsProps {
  posts: Post[];
}

const styles = {
  // 响应式网格：手机1列，平板2列，电脑3列
  grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`,
  
  // 空状态
  empty: {
    container: 'text-center py-16',
    text: 'font-sans text-lg text-muted-foreground',
  },
};

export function RecentBlogs({ posts }: RecentBlogsProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className={styles.empty.container}>
        <p className={styles.empty.text}>暂无博客文章</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {posts.map((post, index) => (
        <BlurFade key={post.id} delay={0.2 + index * 0.1} inView>
          <BlogCardHome
            id={post.id}
            title={post.title}
            description={post.description}
            slug={post.slug}
            image={post.image}
            createdAt={post.createdAt}
          />
        </BlurFade>
      ))}
    </div>
  );
}
