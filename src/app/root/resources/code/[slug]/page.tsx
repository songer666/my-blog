import React from 'react';
import { notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { getR2SignedUrl } from '@/lib/r2-utils';
import { CodeDetail } from '@/components/root/resources/code/item/code-detail';
import { generateCodeDetailMetadata, generateCodeNotFoundMetadata } from '../metadata';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 强制静态生成（SSG）
export const dynamic = 'force-static';

export async function generateMetadata(
  { params }: PageProps,
  parent: any
) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const repository = await queryClient.fetchQuery(
    trpc.codeRepository.bySlugPublic.queryOptions({ slug })
  );

  if (!repository) {
    return await generateCodeNotFoundMetadata(parent);
  }

  return await generateCodeDetailMetadata(repository, parent);
}

export default async function CodeRepositoryPage({ params }: PageProps) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const repository = await queryClient.fetchQuery(
    trpc.codeRepository.bySlugPublic.queryOptions({ slug })
  );

  if (!repository) {
    notFound();
  }

  // 生成演示图片的签名 URL
  const demoImageUrls: string[] = [];
  if (repository.demoImages && repository.demoImages.length > 0) {
    for (const image of repository.demoImages) {
      if (image.r2Key) {
        try {
          const signedUrl = await getR2SignedUrl(image.r2Key);
          demoImageUrls.push(signedUrl);
        } catch (error) {
          console.error(`Failed to generate signed URL for ${image.r2Key}:`, error);
        }
      }
    }
  }

  return <CodeDetail repository={repository} demoImageUrls={demoImageUrls} />;
}
