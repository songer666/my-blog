'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getSignedUrlAction } from '@/server/actions/resources/r2-action';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

interface R2ImageProps {
    r2Key: string;
    alt?: string;
    width?: number;
    height?: number;
    className?: string;
    caption?: string;
}

export const R2Image: FC<R2ImageProps> = ({ 
    r2Key, 
    alt = '', 
    width,
    height,
    className = '',
    caption = ''
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!r2Key) {
            setError('缺少 r2Key 参数');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        getSignedUrlAction(r2Key)
            .then((result) => {
                if (result.success && result.signedUrl) {
                    setImageUrl(result.signedUrl);
                } else {
                    setError(result.error || '获取图片失败');
                }
            })
            .catch((err) => {
                setError('获取图片失败: ' + err.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [r2Key]);

    if (error) {
        return (
            <div className="my-6 flex justify-center">
                <div className={cn(
                    'w-full max-w-3xl p-4 rounded-lg',
                    'border border-red-300 dark:border-red-700',
                    'bg-red-50 dark:bg-red-900/20',
                    'text-red-700 dark:text-red-300',
                    'text-center'
                )}>
                    <p className="text-sm">图片加载失败: {error}</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="my-6 flex justify-center">
                <div className={cn(
                    'w-full max-w-3xl aspect-video rounded-lg',
                    'bg-gray-200 dark:bg-gray-700',
                    'animate-pulse',
                    'flex items-center justify-center'
                )}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">加载中...</p>
                </div>
            </div>
        );
    }

    if (!imageUrl) {
        return null;
    }

    return (
        <BlurFade delay={0.1} inView>
            <figure className="my-6 flex flex-col items-center">
                <div className={cn(
                    'relative w-full max-w-3xl overflow-hidden rounded-lg',
                    'border border-gray-200 dark:border-gray-700',
                    'bg-gray-100 dark:bg-gray-800',
                    className
                )}>
                    {width && height ? (
                        <Image
                            src={imageUrl}
                            alt={alt}
                            width={width}
                            height={height}
                            className="w-full h-auto object-contain"
                            priority={false}
                        />
                    ) : (
                        <img
                            src={imageUrl}
                            alt={alt}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
                    )}
                </div>
                {caption && (
                    <figcaption className={cn(
                        'mt-2 text-sm text-center',
                        'text-gray-600 dark:text-gray-400'
                    )}>
                        {caption}
                    </figcaption>
                )}
            </figure>
        </BlurFade>
    );
};
