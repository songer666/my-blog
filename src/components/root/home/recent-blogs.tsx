import React from 'react';
import { BlogCardHome } from './blog-card-home';

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
  // 响应式网格：手机1列，平板2列，电脑3列（始终显示2行）
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

  // 根据屏幕尺寸显示不同数量的卡片（始终2行）
  // lg以上: 6个(2行×3列), sm-lg: 4个(2行×2列), sm以下: 2个(2行×1列)
  return (
    <div className={styles.grid}>
      {posts.map((post, index) => (
          <BlogCardHome
            key={post.id}
            id={post.id}
            title={post.title}
            description={post.description}
            slug={post.slug}
            image={post.image}
            createdAt={post.createdAt}
            index={index}
            // 响应式隐藏：sm以下只显示前2个，sm-lg显示前4个，lg以上显示全部6个
            className={index >= 6 ? 'hidden' : index >= 4 ? 'hidden lg:block' : index >= 2 ? 'hidden sm:block' : ''}
          />
      ))}
    </div>
  );
}
