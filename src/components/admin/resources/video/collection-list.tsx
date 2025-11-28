"use client";

import type { VideoCollection } from "@/server/types/resources-type";
import { CollectionCard } from "./components/collection-card";

const styles = {
  grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.trim(),
  empty: `text-center py-12 text-muted-foreground`.trim(),
};

interface CollectionListProps {
  collections: VideoCollection[];
}

export function CollectionList({ collections }: CollectionListProps) {
  if (!collections || collections.length === 0) {
    return (
      <div className={styles.empty}>
        <p>暂无视频集</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {collections.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
