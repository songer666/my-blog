"use client";

import { MusicAlbumList } from "@/server/types/resources-type";
import { AlbumCard } from "./components/album-card";
import { Music2 } from "lucide-react";

const styles = {
  emptyContainer: `flex flex-col items-center justify-center py-20 text-center`.trim(),
  emptyIcon: `w-16 h-16 text-muted-foreground/50 mb-4`.trim(),
  emptyTitle: `text-lg font-medium text-muted-foreground`.trim(),
  emptyDescription: `text-sm text-muted-foreground/70 mt-1`.trim(),
  gridContainer: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6`.trim(),
};

interface AlbumListProps {
  albums: MusicAlbumList;
}

export function AlbumList({ albums }: AlbumListProps) {
  if (!albums || albums.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <Music2 className={styles.emptyIcon} />
        <p className={styles.emptyTitle}>暂无音乐专辑</p>
        <p className={styles.emptyDescription}>
          点击右上角按钮创建专辑
        </p>
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {albums.map((album) => (
        <AlbumCard key={album.id} album={album} />
      ))}
    </div>
  );
}
