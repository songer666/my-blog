import React from 'react';
import { serializeMdx } from '@/components/mdx/utils';
import { MdxHydrate } from '@/components/mdx/hydrate';
import { ProjectContentWrapper } from './project-content-wrapper';

interface ProjectContentProps {
  content: string;
  signedUrls?: Record<string, string>;
}

const styles = {
  article: 'prose prose-lg dark:prose-invert max-w-none mb-12',
};

export async function ProjectContent({ content, signedUrls = {} }: ProjectContentProps) {
  const result = await serializeMdx(content, {});
  
  return (
    <ProjectContentWrapper signedUrls={signedUrls}>
      <article className={styles.article}>
        <MdxHydrate serialized={result} toc={false} />
      </article>
    </ProjectContentWrapper>
  );
}

