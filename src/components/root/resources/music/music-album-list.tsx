'use client';

import React from 'react';
import { MusicCard } from './music-card';

interface Album {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  itemCount: number;
  coverImage: string | null;
  keywords: string[] | null;
  tags: string[] | null;
  createdAt: Date;
  items?: Array<{
    id: string;
    coverKey?: string;
  }>;
}

interface MusicAlbumListProps {
  albums: Album[];
}

const pageStyles = {
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
};

export function MusicAlbumList({ albums }: MusicAlbumListProps) {
  return (
      <div className={pageStyles.innerContainer} style={{ marginTop: '3rem' }}>
        {albums.length === 0 ? (
          <div className={pageStyles.empty.container}>
            <p className={pageStyles.empty.title}>暂无专辑</p>
            <p className={pageStyles.empty.subtitle}>更多精彩内容正在准备中...</p>
          </div>
        ) : (
          <div className={pageStyles.grid}>
            {albums.map((album, index) => (
              <MusicCard
                key={album.id}
                id={album.id}
                title={album.title}
                slug={album.slug}
                description={album.description}
                itemCount={album.itemCount}
                coverUrl={album.coverImage}
                keywords={album.keywords}
                tags={album.tags}
                createdAt={album.createdAt}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
  );
}
