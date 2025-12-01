import { visit } from 'unist-util-visit';

/**
 * Remark插件：解析下载指令
 * 语法示例：
 * 方式1 - 直接 URL：
 * :::download{url="https://r2.example.com/file.zip" filename="示例文件.zip" size="2.5MB"}
 * 这是一个可下载的文件
 * :::
 * 
 * 方式2 - R2 Key（自动获取预签名 URL）：
 * :::download{r2Key="/files/example.zip" filename="示例文件.zip" size="2.5MB"}
 * 这是一个可下载的文件
 * :::
 */
const remarkDownload = () => {
    return (tree: any, file: any) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                if (node.name !== 'download') {
                    return;
                }

                // 不支持内联下载指令
                if (node.type === 'textDirective') {
                    file.fail(
                        `Unexpected ':download' text directive. Use ':::download' instead`,
                        node,
                    );
                    return;
                }

                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};

                // 验证必需属性：url 或 r2Key 至少提供一个
                if (!attributes.url && !attributes.r2Key) {
                    file.fail(
                        `Download directive requires either 'url' or 'r2Key' attribute`,
                        node,
                    );
                    return;
                }

                // 获取文件描述（children内容）
                let description = '';
                if (node.children && node.children.length > 0) {
                    const firstChild = node.children[0];
                    if (firstChild.type === 'paragraph' && firstChild.children[0]?.type === 'text') {
                        description = firstChild.children[0].value;
                    }
                }

                // 转换为自定义组件
                data.hName = 'Download';
                data.hProperties = {
                    url: attributes.url || undefined,
                    r2Key: attributes.r2Key || undefined,
                    filename: attributes.filename || '下载文件',
                    size: attributes.size || '',
                    description: description || '',
                    type: attributes.type || '', // 文件类型：pdf, zip, word, video, audio等
                };

                // 清空children，避免重复渲染
                node.children = [];
            }
        });
    };
};

export default remarkDownload;
