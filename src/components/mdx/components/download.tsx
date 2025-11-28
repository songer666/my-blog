'use client';

import type { FC } from 'react';
import { Download as DownloadIcon, FileArchive, FileText, File, FileVideo, FileAudio, FileImage } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

interface DownloadProps {
    url: string;
    filename: string;
    size?: string;
    description?: string;
    type?: string;
}

// 文件类型图标映射
const FILE_ICONS: Record<string, React.ComponentType<any>> = {
    zip: FileArchive,
    rar: FileArchive,
    '7z': FileArchive,
    pdf: FileText,
    doc: FileText,
    docx: FileText,
    mp4: FileVideo,
    avi: FileVideo,
    mov: FileVideo,
    mp3: FileAudio,
    wav: FileAudio,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    gif: FileImage,
};

// 根据文件名或类型获取图标
const getFileIcon = (filename: string, type?: string) => {
    if (type && FILE_ICONS[type.toLowerCase()]) {
        return FILE_ICONS[type.toLowerCase()];
    }
    
    const extension = filename.split('.').pop()?.toLowerCase();
    if (extension && FILE_ICONS[extension]) {
        return FILE_ICONS[extension];
    }
    
    return File;
};

export const Download: FC<DownloadProps> = ({ 
    url, 
    filename, 
    size = '', 
    description = '', 
    type = '' 
}) => {
    const FileIcon = getFileIcon(filename, type);
    const [isDisabled, setIsDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // 清理函数：组件卸载时清除定时器
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    const handleDownload = () => {
        if (isDisabled) return;
        
        // 打开下载链接
        window.open(url, '_blank');
        
        // 禁用按钮30秒
        setIsDisabled(true);
        setCountdown(30);
        
        // 清除之前的定时器（如果存在）
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    if (timerRef.current) {
                        clearInterval(timerRef.current);
                        timerRef.current = null;
                    }
                    setIsDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <BlurFade delay={0.1} inView>
            <div className="my-6 flex justify-center">
                <div className={cn(
                    'w-full max-w-lg',
                    'rounded-lg border border-gray-200 dark:border-gray-600',
                    'bg-gray-100 dark:bg-gray-700/40',
                    'hover:border-gray-300 dark:hover:border-gray-500',
                    'transition-all duration-200'
                )}>
                    <div className="p-3 flex items-center gap-4">
                        {/* 文件图标 */}
                        <div className={cn(
                            'flex-shrink-0 w-9 h-9 rounded',
                            'bg-white dark:bg-gray-600',
                            'flex items-center justify-center'
                        )}>
                            <FileIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                        </div>

                        {/* 文件信息 */}
                        <div className="flex-1 min-w-0 px-1">
                            <h3 className={cn(
                                'text-base font-medium text-gray-900 dark:text-gray-100',
                                'truncate mb-0.5'
                            )}>
                                {filename}
                            </h3>
                            
                            {description && (
                                <p className={cn(
                                    'text-sm text-gray-600 dark:text-gray-300',
                                    'line-clamp-1'
                                )}>
                                    {description}
                                </p>
                            )}
                            
                            {size && (
                                <span className={cn(
                                    'text-xs text-gray-500 dark:text-gray-400'
                                )}>
                                    {size}
                                </span>
                            )}
                        </div>

                        {/* 下载按钮 */}
                        <button
                            onClick={handleDownload}
                            disabled={isDisabled}
                            className={cn(
                                'flex-shrink-0 px-4 py-2 rounded',
                                'bg-gray-800 dark:bg-gray-300',
                                'text-white dark:text-gray-900',
                                'font-medium text-base',
                                'transition-all duration-200',
                                'flex items-center gap-2',
                                'min-w-[90px] justify-center',
                                isDisabled 
                                    ? 'opacity-60 cursor-not-allowed' 
                                    : 'hover:bg-gray-900 dark:hover:bg-gray-200 cursor-pointer'
                            )}
                        >
                            {isDisabled ? (
                                <>
                                    <DownloadIcon className={cn(
                                        'w-4 h-4',
                                        'animate-spin'
                                    )} />
                                    <span className="text-sm">{countdown}s</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">下载</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </BlurFade>
    );
};
