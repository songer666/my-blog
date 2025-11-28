'use client';

import type { FC } from 'react';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { Play } from 'lucide-react';

interface VideoEmbedProps {
    platform: 'bilibili' | 'youtube';
    videoId: string;
    title?: string;
}

export const VideoEmbed: FC<VideoEmbedProps> = ({ 
    platform, 
    videoId,
    title = ''
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    // 生成视频嵌入URL
    const getEmbedUrl = () => {
        if (platform === 'bilibili') {
            return `https://player.bilibili.com/player.html?bvid=${videoId}&page=1&high_quality=1&danmaku=0`;
        } else if (platform === 'youtube') {
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return '';
    };

    const embedUrl = getEmbedUrl();

    const handlePlay = () => {
        setIsPlaying(true);
    };

    // YouTube直接显示iframe，不需要封装
    if (platform === 'youtube') {
        return (
            <BlurFade delay={0.1} inView>
                <div className="my-6 flex justify-center">
                    <div className={cn(
                        'w-full max-w-3xl',
                        'rounded-lg overflow-hidden',
                        'bg-gray-100 dark:bg-gray-800',
                        'border border-gray-200 dark:border-gray-700'
                    )}>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                src={embedUrl}
                                title={title || 'YouTube video'}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                scrolling="no"
                            />
                        </div>
                        {title && (
                            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                                    {title}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </BlurFade>
        );
    }

    // Bilibili需要点击播放
    return (
        <BlurFade delay={0.1} inView>
            <div className="my-6 flex justify-center">
                <div className={cn(
                    'w-full max-w-3xl',
                    'rounded-2xl overflow-hidden',
                    'bg-black',
                    'shadow-lg'
                )}>
                    {/* 16:9 响应式容器 */}
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        {!isPlaying ? (
                            // Bilibili视频预览封面
                            <div 
                                className="absolute top-0 left-0 w-full h-full cursor-pointer group"
                                onClick={handlePlay}
                            >
                                {/* 视频封面 */}
                                <img
                                    src={`https://i0.hdslb.com/bfs/archive/placeholder.jpg`}
                                    alt={title || 'Bilibili video'}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // 封面加载失败时使用渐变背景
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                                
                                {/* 半透明遮罩 */}
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                                
                                {/* 播放按钮 */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className={cn(
                                        'w-16 h-16 rounded-full',
                                        'bg-white/90 backdrop-blur-sm',
                                        'group-hover:bg-white group-hover:scale-110',
                                        'flex items-center justify-center',
                                        'transition-all duration-300',
                                        'shadow-2xl'
                                    )}>
                                        <Play className="w-7 h-7 text-gray-900 ml-0.5" fill="currentColor" />
                                    </div>
                                </div>
                                
                                {/* 进入提示文字 */}
                                <div className="absolute top-4 left-4 right-4">
                                    <p className="text-white/80 text-sm font-medium drop-shadow-lg">
                                        进入哔哩哔哩，观看更高清
                                    </p>
                                </div>
                            </div>
                        ) : (
                            // 加载视频播放器
                            <iframe
                                src={embedUrl}
                                title={title || 'Bilibili video'}
                                className="absolute top-0 left-0 w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                scrolling="no"
                            />
                        )}
                    </div>
                    
                    {/* 视频标题 - 未播放时显示 */}
                    {title && !isPlaying && (
                        <div className="px-4 py-3 bg-black">
                            <p className="text-sm text-white/90 text-center">
                                {title}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </BlurFade>
    );
};
