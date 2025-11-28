import React, { Suspense } from 'react';
import { MdxRender } from '@/components/mdx/render';
import { MdxContentSkeleton } from '@/components/skeleton/mdx-skeleton';

interface BlogContentProps {
  content: string;
}

const styles = {
  article: 'prose prose-lg dark:prose-invert max-w-none mb-12',
};

export async function BlogContent({ content }: BlogContentProps) {
  return (
    <article className={styles.article}>
      <Suspense fallback={<MdxContentSkeleton />}>
        <MdxRender source={content} />
      </Suspense>
    </article>
  );
}
