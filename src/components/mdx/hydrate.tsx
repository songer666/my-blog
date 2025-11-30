'use client';

import type { HydrateProps } from 'next-mdx-remote-client';
import type {MdxHydrateProps} from "@/components/mdx/type";
import { hydrate } from 'next-mdx-remote-client';

import {JSX, useEffect, useMemo, useRef, useState} from "react";
import {defaultMdxHydrateOptions} from "@/components/mdx/options/hydrate-option";
import {isNil} from "lodash";
import {useDeepCompareEffect} from "react-use";
import {deepMerge} from "@/lib/utils";
import {useCodeWindow} from "@/components/mdx/components/copy-code";
import Toc from "@/components/mdx/components/toc";
import { Button } from "@/components/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/ui/popover";
import { ListTree } from "lucide-react";

// 样式常量
const styles = {
    container: `w-full flex`.trim(),
    content: `flex-1 min-w-0 overflow-hidden px-2 sm:px-8`.trim(),
    sidebar: `w-72 min-h-screen bg-blue-50/50 dark:bg-neutral-900 px-6 flex-shrink-0
     sticky top-8 self-start hidden lg:block space-y-4 max-h-[calc(100vh-6rem)] 
     overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
      scrollbar-track-transparent hover:scrollbar-thumb-gray-400 
      dark:hover:scrollbar-thumb-gray-500 scrollbar-thumb-rounded-full`.trim(),
    profile: `p-4 mb-4 mt-4 lg:mt-10 flex items-center gap-3`.trim(),
    profileAvatar: `flex-shrink-0`.trim(),
    profileAvatarImg: `w-12 h-12 rounded-full object-cover`.trim(),
    profileInfo: `flex-1 flex flex-col gap-0.5`.trim(),
    profileName: `text-sm font-semibold text-gray-900 dark:text-white`.trim(),
    profileTitle: `text-xs text-gray-500 dark:text-gray-400`.trim(),
    floatingButton: `fixed bottom-24 sm:bottom-36 right-4 sm:right-6 lg:hidden z-50 shadow-lg rounded-full w-14 h-14 p-0`.trim(),
    popoverContent: `w-[320px] max-h-[500px] overflow-hidden p-0`.trim(),
    popoverHeader: `px-4 py-3 border-b font-semibold text-sm bg-background`.trim(),
    popoverBody: `max-h-[550px] overflow-y-auto`.trim(),
};

export function MdxHydrate(props: MdxHydrateProps & { profile?: any }) {
    const { serialized, toc = true, profile, ...rest } = props;
    const [content, setContent] = useState<JSX.Element | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const options = useMemo(() =>
        deepMerge(defaultMdxHydrateOptions, rest, 'merge'),
        [rest]
    );
    useEffect(() => {
        // 确保页面完全加载
        if (typeof window !== 'undefined') {
            // 获取当前URL的hash
            const hash = decodeURIComponent(window.location.hash);
            if (hash) {
                // 延迟执行以确保DOM已完全渲染
                setTimeout(() => {
                    const element = document.querySelector(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        }
    },[]);

    // 让整个标题都可以点击
    useEffect(() => {
        if (!content) return;
        
        const headings = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        
        const handleHeadingClick = (e: Event) => {
            const heading = e.currentTarget as HTMLElement;
            const id = heading.getAttribute('id');
            if (id) {
                window.history.replaceState(null, '', `#${id}`);
                heading.scrollIntoView({ behavior: 'smooth' });
            }
        };

        headings.forEach(heading => {
            heading.addEventListener('click', handleHeadingClick);
        });

        return () => {
            headings.forEach(heading => {
                heading.removeEventListener('click', handleHeadingClick);
            });
        };
    }, [content]);
    const contentRef = useRef<HTMLDivElement>(null);
    useDeepCompareEffect(() => {
        const { content, error } = hydrate({ ...serialized, ...options } as HydrateProps);
        if (!error && !isNil(content)) setContent(content);
    }, [serialized, options]);
    useCodeWindow(contentRef,content)
    if (isNil(serialized) || 'error' in serialized) return null;
    
    const hasToc = toc && !isNil(serialized.scope?.toc);
    
    return (
        !isNil(content) && (
            <>
                <div className={styles.container}>
                    <div className={styles.content} ref={contentRef}>
                        {content}
                    </div>
                    {hasToc && (
                        <div className={styles.sidebar}>
                            {/* 个人资料信息 */}
                            {profile && (
                                <div className={styles.profile}>
                                    <div className={styles.profileAvatar}>
                                        <img 
                                            src={profile.avatar || '/navbar/cat.jpg'}
                                            alt={profile.name || '头像'}
                                            className={styles.profileAvatarImg}
                                        />
                                    </div>
                                    <div className={styles.profileInfo}>
                                        <span className={styles.profileName}>
                                            {profile.name || '未设置姓名'}
                                        </span>
                                        <span className={styles.profileTitle}>
                                            {profile.title || '未设置职位'}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <Toc toc={serialized.scope.toc as any} />
                        </div>
                    )}
                </div>
                
                {/* 移动端浮动按钮 */}
                {hasToc && (
                    <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                size="icon"
                                className={styles.floatingButton}
                                title="目录和作者"
                            >
                                <ListTree className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                            side="top" 
                            align="end" 
                            className={styles.popoverContent}
                            sideOffset={8}
                        >
                            <div className={styles.popoverBody}>
                                {/* 个人资料信息 */}
                                {profile && (
                                    <div className={styles.profile}>
                                        <div className={styles.profileAvatar}>
                                            <img 
                                                src={profile.avatar || '/navbar/cat.jpg'}
                                                alt={profile.name || '头像'}
                                                className={styles.profileAvatarImg}
                                            />
                                        </div>
                                        <div className={styles.profileInfo}>
                                            <span className={styles.profileName}>
                                                {profile.name || '未设置姓名'}
                                            </span>
                                            <span className={styles.profileTitle}>
                                                {profile.title || '未设置职位'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div className="px-4 pb-4">
                                    <Toc toc={serialized.scope.toc!} />
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </>
        )
    );
};