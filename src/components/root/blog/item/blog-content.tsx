import React from 'react';
import { MdxRender } from '@/components/mdx/render';
import { BlogContentWrapper } from './blog-content-wrapper';

interface BlogContentProps {
  content: string;
  signedUrls?: Record<string, string>;
}

const styles = {
  article: 'prose prose-lg dark:prose-invert max-w-none mb-12',
};

export async function BlogContent({ content, signedUrls = {} }: BlogContentProps) {
  return (
    <BlogContentWrapper signedUrls={signedUrls}>
      <article className={styles.article}>
        <MdxRender source={content} />
      </article>
    </BlogContentWrapper>
  );
}
