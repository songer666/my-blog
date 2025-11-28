import type { Metadata, ResolvingMetadata } from 'next';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { generateProjectDetailMetadata, generateNotFoundMetadata } from '../metadata';

/**
 * 生成项目详情页面的 metadata
 */
export async function generateProjectSlugMetadata(
  slug: string,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const queryClient = getQueryClient();
  const projectResponse = await queryClient.fetchQuery(
    trpc.project.getPublicProjectBySlug.queryOptions({ slug })
  );

  if (!projectResponse.success || !projectResponse.data) {
    return generateNotFoundMetadata(parent);
  }

  const project = projectResponse.data;

  return generateProjectDetailMetadata(
    {
      title: project.title,
      description: project.description,
      keyWords: project.keyWords,
    },
    parent
  );
}

