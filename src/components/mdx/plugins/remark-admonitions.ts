import { visit } from 'unist-util-visit';

const _ADMONITION_TYPES = ['note', 'tip', 'info', 'warning', 'danger'] as const;
export type AdmonitionType = (typeof _ADMONITION_TYPES)[number];

// 添加类型映射
const TYPE_MAPPING: Record<string, AdmonitionType> = {
    note: 'note',
    tip: 'tip',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
} as const;

const remarkAdmonitions = () => {
    return (tree: any, file: any) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const inputType = node.name as string;
                // 使用映射转换类型
                const type = TYPE_MAPPING[inputType];

                if (!type) {
                    return;
                }

                if (node.type === 'textDirective') {
                    file.fail(
                        `Unexpected ':${type}' text directive. Use ':::${type}' instead`,
                        node,
                    );
                    return;
                }

                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};

                // 获取第一个子节点作为标题
                let title;
                if (node.children && node.children[0]?.type === 'paragraph') {
                    const firstChild = node.children[0];
                    if (firstChild.children[0]?.type === 'text') {
                        title = firstChild.children[0].value;
                        node.children.shift();
                    }
                }

                // 使用大写的组件名
                data.hName = 'Admonition';
                data.hProperties = {
                    type, // 使用映射后的类型
                    title: title || attributes.title,
                    ...attributes,
                };
            }
        });
    };
};

export default remarkAdmonitions;
