import { visit } from 'unist-util-visit';

/**
 * Remark插件：解析 R2 图片指令
 * 语法示例：
 * :::r2-image{r2Key="/images/example.png" alt="示例图片" width="800" height="600"}
 * 图片说明文字（可选）
 * :::
 * 
 * 或者使用简化语法（leafDirective）：
 * ::r2-image{r2Key="/images/example.png" alt="示例图片"}
 */
const remarkR2Image = () => {
    return (tree: any, file: any) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                if (node.name !== 'r2-image') {
                    return;
                }

                // 不支持内联图片指令
                if (node.type === 'textDirective') {
                    file.fail(
                        `Unexpected ':r2-image' text directive. Use ':::r2-image' or '::r2-image' instead`,
                        node,
                    );
                    return;
                }

                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};

                // 验证必需属性
                if (!attributes.r2Key) {
                    file.fail(
                        `R2Image directive requires 'r2Key' attribute`,
                        node,
                    );
                    return;
                }

                // 获取图片说明（children内容）
                let caption = '';
                if (node.children && node.children.length > 0) {
                    const firstChild = node.children[0];
                    if (firstChild.type === 'paragraph' && firstChild.children[0]?.type === 'text') {
                        caption = firstChild.children[0].value;
                    }
                }

                // 转换为自定义组件
                data.hName = 'R2Image';
                data.hProperties = {
                    r2Key: attributes.r2Key,
                    alt: attributes.alt || caption || '',
                    width: attributes.width ? parseInt(attributes.width) : undefined,
                    height: attributes.height ? parseInt(attributes.height) : undefined,
                    className: attributes.className || '',
                    caption: caption || '',
                };

                // 清空children，避免重复渲染
                node.children = [];
            }
        });
    };
};

export default remarkR2Image;
