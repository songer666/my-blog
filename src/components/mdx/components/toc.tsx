'use client';

import {HeadingDepth, HeadingParent, TocItem} from "remark-flexible-toc";
import {useCallback, useEffect, useRef, useState} from "react";
import {cn} from "@/lib/utils";

interface Props {
    toc: TocItem[];
    maxDepth?: HeadingDepth;
    indented?: boolean;
    ordered?: boolean;
    tight?: boolean;
    exclude?: string | string[];
    skipLevels?: HeadingDepth[];
    skipParents?: Exclude<HeadingParent, 'root'>[];
}

// 样式常量
const styles = {
    container: `bg-transparent rounded-lg p-0 sticky top-20`.trim(),
    card: `rounded-md p-4 bg-zinc-50 dark:bg-neutral-800 border-2`.trim(),
    title: `text-sm dark:text-zinc-100 font-semibold mb-4 border-b border-gray-200 dark:border-gray-700 pb-2`.trim(),
    list: `max-w-fit overflow-hidden text-sm relative flex flex-col space-y-0`.trim(),
    listItem: (tight: boolean) => cn(
        'flex items-center relative py-0 ml-0 transition-colors duration-200',
        tight && 'my-0'
    ),
    link: `block w-full px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200`.trim(),
    linkContent: (indented: boolean, depth: number) => cn(
        'transition-transform duration-200',
        indented && getIndentClass(depth)
    ),
    activeItem: `font-medium text-gray-800 dark:text-gray-100 border-b border-gray-400 dark:border-gray-500 inline pb-0.5`.trim(),
    numberPrefix: `mr-2 text-[var(--primary)]`.trim(),
};

// 缩进映射
const getIndentClass = (depth: number): string => {
    const indentMap: Record<number, string> = {
        1: 'pl-0',
        2: 'pl-0',
        3: 'pl-3',
        4: 'pl-5',
        5: 'pl-7',
        6: 'pl-9',
    };
    return indentMap[depth] || 'pl-0';
};

export default function Toc(
    {toc, maxDepth = 6, ordered = false, indented = true,
        tight = false, exclude, skipLevels = [1],
        skipParents = []}: Props){
    const [activeId, setActiveId] = useState('');
    const tocListRef = useRef<HTMLUListElement>(null);

    // 处理页面滚动到顶部时清除哈希
    useEffect(() => {
        const handleScroll = () => {
            // 当页面滚动到顶部时（允许一定的误差范围）
            if (window.scrollY <= 10 && activeId !== '') {
                setActiveId('');
                window.history.replaceState(null, '', window.location.pathname);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [activeId]);

    // 处理标题可见性检测
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleHeadings = entries
                    .filter((entry) => entry.isIntersecting)
                    .map((entry) => ({
                        id: entry.target.id,
                        top: entry.boundingClientRect.top,
                    }))
                    .sort((a, b) => Math.abs(a.top) - Math.abs(b.top));

                if (visibleHeadings.length > 0) {
                    const nearestHeading = visibleHeadings[0];
                    if (nearestHeading.id !== activeId) {
                        setActiveId(nearestHeading.id);
                        window.history.replaceState(null, '', `#${nearestHeading.id}`);
                    }
                }
            },
            {
                rootMargin: '-80px 0px -80% 0px',
                threshold: [0, 1],
            },
        );

        document
            .querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
            .forEach((heading) => observer.observe(heading));

        return () => observer.disconnect();
    }, [activeId]);

    // 处理点击事件
    const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const heading = document.getElementById(id);
        if (heading) {
            setActiveId(id);
            window.history.replaceState(null, '', `#${id}`);
            heading.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);

    if (!toc) return null;

    // ********* filters **************
    const exludeRegexFilter = exclude
        ? Array.isArray(exclude)
            ? new RegExp(exclude.join('|'), 'i')
            : new RegExp(exclude, 'i')
        : /(?!)/;

    const skipLevelsFilter = (depth: TocItem['depth']): boolean => skipLevels.includes(depth);

    const skipParentsFilter = (parent: TocItem['parent']): boolean =>
        parent !== 'root' && skipParents.includes(parent);

    const maxDepthFilter = (depth: TocItem['depth']): boolean => depth > maxDepth;
    // ********************************

    const filteredToc = toc.filter(
        (heading) =>
            !maxDepthFilter(heading.depth) &&
            !skipLevelsFilter(heading.depth) &&
            !skipParentsFilter(heading.parent) &&
            !exludeRegexFilter.test(heading.value),
    );

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.title} style={{letterSpacing: '0.025em'}}>
                    目录
                </div>
                <ul ref={tocListRef} className={styles.list}>
                    {filteredToc.map((heading) => {
                        const headingId = heading.href.replace(/^#/, '');
                        const isActive = headingId === activeId;
                        return (
                            <li
                                key={heading.href}
                                data-active={isActive}
                                className={styles.listItem(tight)}
                            >
                                <a 
                                    href={`#${headingId}`} 
                                    onClick={(e) => handleClick(e, headingId)}
                                    className={styles.link}
                                    style={{cursor: 'default'}}
                                >
                                    <div className={styles.linkContent(indented, heading.depth)}>
                                        {ordered ? (
                                            <strong>
                                                <span className={styles.numberPrefix}>
                                                    {heading.numbering.slice(1).join('.')}.
                                                </span>
                                            </strong>
                                        ) : null}
                                        <span className={cn(isActive && styles.activeItem)}>
                                            {heading.value}
                                        </span>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
