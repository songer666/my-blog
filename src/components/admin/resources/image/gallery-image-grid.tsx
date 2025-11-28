"use client";

import { ImageGallery } from "@/server/types/resources-type";
import { GalleryImageCard } from "./components/gallery-image-card";
import { GalleryImageWaterfallItem } from "./components/gallery-image-waterfall";
import { ImageIcon } from "lucide-react";

const styles = {
    emptyContainer: `flex flex-col items-center justify-center py-20 text-center mt-6`.trim(),
    emptyIcon: `w-16 h-16 text-muted-foreground/50 mb-4`.trim(),
    emptyTitle: `text-lg font-medium text-muted-foreground`.trim(),
    emptyDescription: `text-sm text-muted-foreground/70 mt-1`.trim(),
    gridContainer: `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-6`.trim(),
    waterfallItem: `break-inside-avoid mb-4`.trim(),
};

const getWaterfallColumns = (columns: number) => {
    switch (columns) {
        case 2:
            return 'columns-1 sm:columns-2 gap-4 mt-6';
        case 3:
            return 'columns-1 sm:columns-2 lg:columns-3 gap-4 mt-6';
        case 4:
            return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 mt-6';
        default:
            return 'columns-1 sm:columns-2 lg:columns-3 gap-4 mt-6';
    }
};

interface GalleryImageGridProps {
    gallery: ImageGallery;
    viewMode?: 'card' | 'waterfall';
    waterfallColumns?: number;
}

export function GalleryImageGrid({ gallery, viewMode = 'card', waterfallColumns = 3 }: GalleryImageGridProps) {
    if (!gallery.items || gallery.items.length === 0) {
        return (
            <div className={styles.emptyContainer}>
                <ImageIcon className={styles.emptyIcon} />
                <p className={styles.emptyTitle}>暂无图片</p>
                <p className={styles.emptyDescription}>
                    点击右上角按钮上传图片
                </p>
            </div>
        );
    }

    // 瀑布流模式
    if (viewMode === 'waterfall') {
        return (
            <div className={getWaterfallColumns(waterfallColumns)}>
                {gallery.items.map((image) => (
                    <div key={image.id} className={styles.waterfallItem}>
                        <GalleryImageWaterfallItem image={image} />
                    </div>
                ))}
            </div>
        );
    }

    // 卡片模式
    return (
        <div className={styles.gridContainer}>
            {gallery.items.map((image) => (
                <GalleryImageCard key={image.id} image={image} galleryId={gallery.id} />
            ))}
        </div>
    );
}
