import React from 'react';
import {
  Github,
  MessageCircle,
  Code,
  Linkedin,
  Twitter,
  MessageSquare,
  Zap,
  Globe,
  Youtube,
  Home,
  Link,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 图标映射
const ICON_MAP = {
  Github,
  MessageCircle,
  Code,
  Linkedin,
  Twitter,
  MessageSquare,
  Zap,
  Globe,
  Youtube,
  Home,
  Link,
  Mail,
  custom: null, // 自定义图标
} as const;

interface PlatformIconProps {
  iconName: keyof typeof ICON_MAP;
  iconSrc?: string; // 自定义图标的路径
  svgPath?: string; // SVG Path 数据
  iconType?: 'lucide' | 'custom' | 'svg';
  color?: string;
  size?: number;
  className?: string;
}

export function PlatformIcon({ 
  iconName, 
  iconSrc,
  svgPath,
  iconType = 'lucide',
  color = '#6366F1', 
  size = 20, 
  className 
}: PlatformIconProps) {
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center rounded-full p-2",
        className
      )}
      style={{ backgroundColor: color + '20' }} // 20% opacity background
    >
      {iconType === 'custom' && iconSrc ? (
        <img 
          src={iconSrc} 
          alt="platform icon" 
          width={size} 
          height={size}
          style={{ filter: `drop-shadow(0 0 0 ${color})` }}
        />
      ) : iconType === 'svg' && svgPath ? (
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          width={size} 
          height={size}
          style={{ color }}
        >
          {/* 支持多个 path，如果在 svgPath 中包含多个 d="..." 或直接是 path 标签字符串 */}
          {svgPath.includes('<path') ? (
             <g dangerouslySetInnerHTML={{ __html: svgPath }} />
          ) : (
             <path d={svgPath} />
          )}
        </svg>
      ) : (
        (() => {
          const IconComponent = ICON_MAP[iconName] || Link;
          return (
            <IconComponent 
              size={size} 
              style={{ color }} 
            />
          );
        })()
      )}
    </div>
  );
}
