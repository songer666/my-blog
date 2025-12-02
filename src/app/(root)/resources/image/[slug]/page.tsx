import React from 'react';
import { notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { generateGalleryDetailMetadata, generateGalleryNotFoundMetadata } from '../metadata';
import { GalleryDetail } from '@/components/root/resources/image/item/gallery-detail';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';
import { getBatchSignedUrlsAction } from '@/server/actions/resources/r2-action';

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

  // 批量获取签名 URL
  const r2Keys = gallery.items.map(item => item.r2Key);
  let signedUrls: Record<string, string> = {};
  
  if (r2Keys.length > 0) {
    const result = await getBatchSignedUrlsAction(r2Keys);
    if (result.success && result.signedUrls) {
      signedUrls = result.signedUrls as Record<string, string>;
    }
  }

  return (
    <R2UrlProvider signedUrls={signedUrls}>
      <GalleryDetail gallery={gallery} />
    </R2UrlProvider>
  );
}
