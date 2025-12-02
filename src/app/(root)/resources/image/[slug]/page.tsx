import React from 'react';
import { notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { generateGalleryDetailMetadata, generateGalleryNotFoundMetadata } from '../metadata';
import { GalleryDetail } from '@/components/root/resources/image/item/gallery-detail';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';

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
  const gallery = await queryClient.fetchQuery(
    trpc.imageGallery.bySlugPublic.queryOptions({ slug })
  );

  if (!gallery) {
    return await generateGalleryNotFoundMetadata(parent);
  }

  return await generateGalleryDetailMetadata(gallery, parent);
}

export default async function GalleryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const queryClient = getQueryClient();
  const gallery = await queryClient.fetchQuery(
    trpc.imageGallery.bySlugPublic.queryOptions({ slug })
  );

  if (!gallery) {
    notFound();
  }

  // 不在服务端获取签名 URL,改为客户端按需从缓存获取
  return (
    <R2UrlProvider signedUrls={{}}>
      <GalleryDetail gallery={gallery} />
    </R2UrlProvider>
  );
}
