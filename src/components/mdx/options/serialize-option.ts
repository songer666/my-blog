import type { MDXRemoteProps } from 'next-mdx-remote-client/rsc';

import rehypePrism from 'rehype-prism-plus';
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import {rehypeCodeWindow} from "@/components/mdx/plugins/rehype-code-window";
import remarkDirective from "remark-directive";
import remarkAdmonitions from "@/components/mdx/plugins/remark-admonitions";
import remarkDownload from "@/components/mdx/plugins/remark-download";
import remarkVideo from "@/components/mdx/plugins/remark-video";
import remarkR2Image from "@/components/mdx/plugins/remark-r2-image";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import remarkFlexibleToc from 'remark-flexible-toc';

/**
 * 默认mdx配置
 */
export const defaultMdxSerializeOptions: Omit<MDXRemoteProps, 'source'> = {
    options: {
        disableImports: true,
        parseFrontmatter: true,
        vfileDataIntoScope: 'toc',
        mdxOptions: {
            remarkPlugins: [remarkDirective,remarkAdmonitions,remarkDownload,remarkVideo,remarkR2Image,remarkGfm,remarkFlexibleToc],
            rehypePlugins: [
                rehypeSlug,
                [rehypeExternalLinks, {target: '_blank'}],
                [rehypeAutolinkHeadings, { behavior: 'append' }],
                [rehypePrism, { showLineNumbers: false, ignoreMissing: true }],
                rehypeCodeWindow,
            ],
        },
    },
};