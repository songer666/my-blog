'use client';

import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { X } from 'lucide-react';
import { useR2Url } from '../context/r2-url-context';

interface R2ImageProps {
    r2Key: string;
    alt?: string;
    className?: string;
    caption?: string;
}

export const R2Image: FC<R2ImageProps> = ({ 
    r2Key, 
    alt = '', 
    className = '',
    caption = ''
}) => {
    // 从 Context 获取预签名 URL
    const imageUrl = useR2Url(r2Key);
    const [error, setError] = useState<string | null>(null);
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (!r2Key) {
            setError('缺少 r2Key 参数');
            return;
        }

        if (!imageUrl) {
            setError('未找到图片 URL');
        } else {
            setError(null);
        }
    }, [r2Key, imageUrl]);

    // 处理 ESC 键关闭放大视图
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isZoomed) {
                setIsZoomed(false);
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isZoomed]);

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

    if (!imageUrl) {
        return null;
    }

    return (
        <>
            <BlurFade delay={0.1} inView>
                <figure className="my-4 w-full">
                    <div 
                        className={cn(
                            'relative w-full overflow-hidden rounded-lg cursor-pointer',
                            'border border-gray-200 dark:border-gray-700',
                            'bg-gray-100 dark:bg-gray-800',
                            'transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600',
                            className
                        )}
                        onClick={() => setIsZoomed(true)}
                    >
                        <img
                            src={imageUrl}
                            alt={alt}
                            className="w-full h-auto object-contain"
                            loading="lazy"
                        />
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

            {/* 放大视图 Modal */}
            {isZoomed && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
                    onClick={() => setIsZoomed(false)}
                >
                    {/* 关闭按钮 */}
                    <button
                        className={cn(
                            'absolute top-4 right-4 p-2 rounded-full',
                            'bg-white/10 hover:bg-white/20',
                            'text-white transition-colors duration-200'
                        )}
                        onClick={() => setIsZoomed(false)}
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* 放大的图片 */}
                    <div className="max-w-[95vw] max-h-[95vh] p-4">
                        <img
                            src={imageUrl}
                            alt={alt}
                            className="max-w-full max-h-full object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
};
