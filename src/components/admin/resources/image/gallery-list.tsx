"use client";

import { ImageGalleryList } from "@/server/types/resources-type";
import { GalleryCard } from "./components/gallery-card";
import { FolderOpen } from "lucide-react";

const styles = {
  emptyContainer: `flex flex-col items-center justify-center py-20 text-center`.trim(),
  emptyIcon: `w-16 h-16 text-muted-foreground/50 mb-4`.trim(),
  emptyTitle: `text-lg font-medium text-muted-foreground`.trim(),
  emptyDescription: `text-sm text-muted-foreground/70 mt-1`.trim(),
  gridContainer: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6`.trim(),
};

interface GalleryListProps {
  galleries: ImageGalleryList;
}

export function GalleryList({ galleries }: GalleryListProps) {
  if (!galleries || galleries.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <FolderOpen className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>暂无图库</p>
        <p className={styles.emptyDescription}>
          点击右上角按钮创建图库
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {galleries.map((gallery) => (
        <GalleryCard key={gallery.id} gallery={gallery} />
      ))}
    </div>
  );
}
