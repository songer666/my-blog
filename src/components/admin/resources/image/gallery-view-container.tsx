"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Grid3x3, LayoutGrid } from "lucide-react";
import { ImageGallery } from "@/server/types/resources-type";
import { GalleryImageGrid } from "./gallery-image-grid";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/shadcn/ui/select";

type ViewMode = 'card' | 'waterfall';

interface GalleryViewContainerProps {
    gallery: ImageGallery;
}

export function GalleryViewContainer({ gallery }: GalleryViewContainerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('card');
    const [waterfallColumns, setWaterfallColumns] = useState<number>(3);

    return (
        <>
            {/* 模式切换和列数选择 */}
            <div className="flex justify-end items-center gap-3 mb-4">
                {viewMode === 'waterfall' && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">列数:</span>
                        <Select
                            value={waterfallColumns.toString()}
                            onValueChange={(value) => setWaterfallColumns(Number(value))}
                        >
                            <SelectTrigger className="w-[80px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="2">2列</SelectItem>
                                <SelectItem value="3">3列</SelectItem>
                                <SelectItem value="4">4列</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <Button
                    variant={viewMode === 'waterfall' ? 'default' : 'outline'}
                    onClick={() => setViewMode(viewMode === 'card' ? 'waterfall' : 'card')}
                    title={viewMode === 'card' ? '切换到图床模式' : '切换到卡片模式'}
                >
                    {viewMode === 'card' ? (
                        <>
                            <Grid3x3 className="h-4 w-4 mr-2" />
                            图床模式
                        </>
                    ) : (
                        <>
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            卡片模式
                        </>
                    )}
                </Button>
            </div>

            {/* 图片网格 */}
            <GalleryImageGrid
                gallery={gallery}
                viewMode={viewMode}
                waterfallColumns={waterfallColumns}
            />
        </>
    );
}
