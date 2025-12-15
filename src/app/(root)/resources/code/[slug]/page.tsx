import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { CodeDetail } from '@/components/root/resources/code/item/code-detail';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';
import { generateCodeDetailMetadata, generateCodeNotFoundMetadata } from '../metadata';
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// 强制静态生成（SSG）
export const dynamic = 'force-static';

export async function generateMetadata(
  { params }: PageProps,
  parent: any
): Promise<Metadata> {
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

  // 不在服务端获取签名 URL，客户端按需从缓存获取
  return (
    <R2UrlProvider signedUrls={{}}>
        <CodeDetail repository={repository!}/>
    </R2UrlProvider>
  );
}
