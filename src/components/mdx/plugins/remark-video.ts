import { visit } from 'unist-util-visit';

/**
 * Remark插件：解析视频嵌入指令
 * 支持Bilibili和YouTube
 * 
 * 语法示例：
 * :::bilibili{id="BV1qgyGBgE5K"}
 * :::
 * 
 * :::youtube{id="dQw4w9WgXcQ"}
 * :::
 */
const remarkVideo = () => {
    return (tree: any, file: any) => {
        visit(tree, (node) => {
            if (
                node.type === 'containerDirective' ||
                node.type === 'leafDirective' ||
                node.type === 'textDirective'
            ) {
                const platform = node.name as string;
                
                // 只处理bilibili和youtube指令
                if (platform !== 'bilibili' && platform !== 'youtube') {
                    return;
                }

                // 不支持内联视频指令
                if (node.type === 'textDirective') {
                    file.fail(
                        `Unexpected ':${platform}' text directive. Use ':::${platform}' instead`,
                        node,
                    );
                    return;
                }

                const data = node.data || (node.data = {});
                const attributes = node.attributes || {};

                // 验证必需属性
                if (!attributes.id) {
                    file.fail(
                        `${platform} video directive requires an 'id' attribute`,
                        node,
                    );
                    return;
                }

                // 转换为自定义组件
                data.hName = 'VideoEmbed';
                data.hProperties = {
                    platform,
                    videoId: attributes.id,
                    title: attributes.title || '',
                };

                // 清空children，避免重复渲染
                node.children = [];
            }
        });
    };
};

export default remarkVideo;
