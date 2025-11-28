import React, { Suspense } from 'react';
import { serializeMdx } from '@/components/mdx/utils';
import { MdxHydrate } from '@/components/mdx/hydrate';
import { MdxContentSkeleton } from '@/components/skeleton/mdx-skeleton';

interface ProjectContentProps {
  content: string;
}

const styles = {
  article: 'prose prose-lg dark:prose-invert max-w-none mb-12',
};

export async function ProjectContent({ content }: ProjectContentProps) {
  const result = await serializeMdx(content, {});
  
  return (
    <article className={styles.article}>
      <Suspense fallback={<MdxContentSkeleton />}>
        <MdxHydrate serialized={result} toc={false} />
      </Suspense>
    </article>
  );
}

