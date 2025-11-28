"use client";

import { useState, useEffect } from "react";
import { GalleryImageItem } from "@/server/types/resources-type";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { getSignedUrlAction } from "@/server/actions/resources/r2-action";

const styles = {
    imageWrapper: `overflow-hidden rounded-lg`.trim(),
    image: `w-full h-auto object-cover`.trim(),
    loadingContainer: `w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground rounded-lg`.trim(),
};

interface GalleryImageWaterfallItemProps {
    image: GalleryImageItem;
}

export function GalleryImageWaterfallItem({ image }: GalleryImageWaterfallItemProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSignedUrl = async () => {
        setLoading(true);
        try {
            const result = await getSignedUrlAction(image.r2Key);
            if (result.success && result.signedUrl) {
                setImageUrl(result.signedUrl);
            } else {
                toast.error("获取图片失败");
            }
        } catch (error) {
            toast.error("获取图片失败");
        } finally {
            setLoading(false);
        }
    };


    // 加载签名 URL
    useEffect(() => {
        fetchSignedUrl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
        );
    }

    if (!imageUrl) {
        return (
            <div className={styles.loadingContainer}>
                <p className="text-sm">加载失败</p>
            </div>
        );
    }

    return (
        <div className={styles.imageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={imageUrl}
                alt={image.alt || image.name}
                className={styles.image}
            />
        </div>
    );
}
