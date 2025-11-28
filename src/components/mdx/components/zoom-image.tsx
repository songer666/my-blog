import React from 'react';
import { cn } from '@/lib/utils';

/**
 * ZoomImage 组件
 * 
 * 用于在 MDX 中显示可以点击/悬停放大的图片。
 * 
 * 使用方式:
 * 1. 在 MDX 文件中直接使用:
 *    <ZoomImage src="/path/to/image.png" alt="描述" width="100%" />
 * 
 * 2. 该组件已在 `src/components/mdx/options/hydrate-option.tsx` 中注册，
 *    无需在 `src/components/mdx/plugins` 中添加额外的 remark/rehype 插件。
 */

interface ZoomImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  containerClassName?: string;
}

export const ZoomImage: React.FC<ZoomImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  ...props
}) => {
  return (
    <div 
      className={cn(
        "overflow-hidden rounded-lg inline-block my-4", 
        containerClassName
      )}
      style={{ width: width ? 'fit-content' : undefined }}
    >
      <img
        src={src}
        alt={alt || 'image'}
        style={{ 
            width: width,
            height: height 
        }}
        className={cn(
          "transition-transform duration-300 hover:scale-110 max-w-full h-auto object-cover rounded-lg",
          className
        )}
        {...props}
      />
    </div>
  );
};
