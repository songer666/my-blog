'use client';

import React, { useState, useEffect } from 'react';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';
import { MdxContentSkeleton } from '@/components/skeleton/mdx-skeleton';

interface ProjectContentWrapperProps {
  children: React.ReactNode;
  signedUrls: Record<string, string>;
}

export function ProjectContentWrapper({ children, signedUrls }: ProjectContentWrapperProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <R2UrlProvider signedUrls={signedUrls}>
      {!isLoaded ? <MdxContentSkeleton /> : children}
    </R2UrlProvider>
  );
}
