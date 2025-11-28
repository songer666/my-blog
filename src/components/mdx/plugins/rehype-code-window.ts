import type { Element } from 'mdx/types';

import { visit } from 'unist-util-visit';

export const rehypeCodeWindow = () => {
    return (tree: any) => {
        visit(
            tree,
            'element',
            (node: Element, index: number | undefined, parent: Element | null) => {
                if (node.tagName === 'pre' && parent && typeof index === 'number') {
                    const language =
                        (node.properties?.className as string[])?.[0]
                            ?.toString()
                            .replace('language-', '') || '';

                    const wrapper: Element = {
                        type: 'element',
                        tagName: 'div',
                        properties: { className: ['code-window'] },
                        children: [
                            {
                                type: 'element',
                                tagName: 'div',
                                properties: {
                                    className: ['code-header'],
                                },
                                children: [
                                    {
                                        type: 'element',
                                        tagName: 'div',
                                        properties: { className: ['window-controls'] },
                                        children: [
                                            {
                                                type: 'element',
                                                tagName: 'span',
                                                properties: { className: ['control', 'close'] },
                                                children: [],
                                            },
                                            {
                                                type: 'element',
                                                tagName: 'span',
                                                properties: { className: ['control', 'minimize'] },
                                                children: [],
                                            },
                                            {
                                                type: 'element',
                                                tagName: 'span',
                                                properties: { className: ['control', 'maximize'] },
                                                children: [],
                                            },
                                        ],
                                    },
                                    {
                                        type: 'element',
                                        tagName: 'span',
                                        properties: { className: ['code-lang'] },
                                        children: [{ type: 'text', value: language }],
                                    },
                                ],
                            },
                            {
                                type: 'element',
                                tagName: 'div',
                                properties: { className: ['code-content'] },
                                children: [{ ...node }],
                            },
                        ],
                    };

                    parent.children[index] = wrapper;
                }
            },
        );
    };
};
