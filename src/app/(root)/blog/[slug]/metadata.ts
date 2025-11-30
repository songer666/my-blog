import type { Metadata, ResolvingMetadata } from 'next';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { generateBlogPostMetadata, generateNotFoundMetadata } from '../metadata';

/**
 * 生成博客详情页面的 metadata
 */
export async function generateBlogDetailMetadata(
  slug: string,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const queryClient = getQueryClient();
  const postResponse = await queryClient.fetchQuery(
    trpc.post.getPublicPostBySlug.queryOptions({ slug })
  );

  if (!postResponse.success || !postResponse.data) {
    return generateNotFoundMetadata(parent);
  }

  const post = postResponse.data;

  return generateBlogPostMetadata(
    {
      title: post.title,
      description: post.description,
      keyWords: post.keyWords,
    },
    parent
  );
}
