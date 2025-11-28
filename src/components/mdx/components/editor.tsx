'use client';

import '@uiw/react-md-editor/markdown-editor.css';
import './editor-global.css';
import { debounce, isNil } from 'lodash';
import dynamic from 'next/dynamic';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { MdxEditorProps, MdxHydrateProps } from '@/components/mdx/type';

import { MdxHydrate } from '@/components/mdx/hydrate';
import { serializeMdx } from '@/components/mdx/utils';
import { useTheme } from "next-themes";
import { Skeleton } from '@/components/shadcn/ui/skeleton';

// 编辑器加载骨架屏组件
const EditorLoadingSkeleton = () => (
    <div className="w-full space-y-4 p-4 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800" style={{ minHeight: '500px' }}>
        {/* 工具栏骨架 */}
        <div className="flex gap-2 pb-4 border-b border-gray-300 dark:border-gray-600">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <div className="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
        </div>
        
        {/* 编辑区域骨架 */}
        <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <div className="py-4" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="py-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
        </div>
    </div>
);

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { 
    ssr: false,
    loading: () => <EditorLoadingSkeleton />,
});

export const MdxEditor: FC<MdxEditorProps> = (props) => {
    const { content, setContent, disabled } = props;
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [serialized, setSerialized] = useState<MdxHydrateProps['serialized']>();
    const containerRef = useRef<HTMLDivElement>(null);
    const [editorHeight, setEditorHeight] = useState<number>(650);

    // 确保组件在客户端挂载后再渲染
    useEffect(() => {
        setMounted(true);
    }, []);

    // 防抖效果，减少序列化次数
    const debouncedSerialize = useCallback(
        debounce(async (text: string) => {
            const serialized = await serializeMdx(text);
            setSerialized(serialized);
        }, 1000),
        [],
    );

    useEffect(() => {
        if (!isNil(content) && mounted) {
            debouncedSerialize(content);
        }
        return () => {
            debouncedSerialize.cancel();
        };
    }, [content, mounted, debouncedSerialize]);

    const updateHeight = useCallback(() => {
        if (containerRef.current) {
            const parentHeight = containerRef.current.clientHeight;
            // 如果父容器有高度，使用父容器高度，否则使用默认高度
            const newHeight = parentHeight > 100 ? parentHeight : 650;
            setEditorHeight(newHeight);
        }
    }, []);

    useEffect(() => {
        if (mounted) {
            // 初始化时设置高度
            updateHeight();
            window.addEventListener('resize', updateHeight);
            return () => {
                window.removeEventListener('resize', updateHeight);
            };
        }
    }, [mounted, updateHeight]);

    // 在客户端挂载前显示骨架屏
    if (!mounted) {
        return (
            <div className={'flex flex-auto w-full min-h-[650px]'}>
                <EditorLoadingSkeleton />
            </div>
        );
    }

    return (
        <div 
            ref={containerRef} 
            data-color-mode={theme || 'light'} 
            className={'flex flex-auto w-full min-h-[650px]'}
            suppressHydrationWarning
        >
            {!serialized ? (
                <EditorLoadingSkeleton />
            ) : (
                <>
                    <div className="wmde-markdown-var"> </div>
                    <MDEditor
                        value={content}
                        onChange={setContent}
                        height={editorHeight}
                        minHeight={editorHeight}
                        textareaProps={{ disabled }}
                        visibleDragbar
                        components={{
                            preview: () => <MdxHydrate serialized={serialized} toc={false} />,
                        }}
                    />
                </>
            )}
        </div>
    );
};