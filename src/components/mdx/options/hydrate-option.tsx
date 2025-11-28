// src/app/_components/mdx/options/hydrate.tsx
import type { HydrateProps } from 'next-mdx-remote-client';

import { Admonition } from '@/components/mdx/components/admonition';
import { Download } from '@/components/mdx/components/download';
import { VideoEmbed } from '@/components/mdx/components/video-embed';
import { ZoomImage } from '@/components/mdx/components/zoom-image';
import '@/components/mdx/styles/index.css';

/**
 * 默认mdx水合组件配置
 */
export const defaultMdxHydrateOptions: Omit<HydrateProps, 'compiledSource'> = {
    components: {
        wrapper: ({ children }) => (
            <div className="mdx-preview">{children}</div>
        ),
        // 只使用大写的组件名
        Admonition,
        Download,
        VideoEmbed,
        ZoomImage,
    },
};