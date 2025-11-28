import React from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Youtube, 
  Instagram, 
  Facebook, 
  Globe, 
  Twitch,
  Code2,
  Terminal,
  MessageCircle,
  ExternalLink
} from 'lucide-react';

// X (Twitter) 图标
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// 掘金图标
const JuejinIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L16 5L12 8L8 5Z" />
    <path d="M12 11.5L17 7L20 7L12 14.5L4 7L7 7Z" />
    <path d="M12 19.5L17 15L20 15L12 22.5L4 15L7 15Z" />
  </svg>
);

// Bilibili 图标
const BilibiliIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.813 4.653h.854c1.51.054 2.769.31 3.737 1.278.969.968 1.224 2.226 1.278 3.737v8.662c-.054 1.51-.31 2.769-1.278 3.737-.968.969-2.226 1.224-3.737 1.278H5.333c-1.51-.054-2.769-.31-3.737-1.278-.969-.968-1.224-2.226-1.278-3.737V9.668c.054-1.51.31-2.769 1.278-3.737.968-.969 2.226-1.224 3.737-1.278h.853l2.88-3.02a.81.81 0 01.818-.23.81.81 0 01.55.54.806.806 0 01-.16.84l-2.54 2.66h8.363l-2.54-2.66a.805.805 0 01-.16-.84.81.81 0 011.368-.31l2.88 3.02zM6.306 11.628c-.685 0-1.24.676-1.24 1.51 0 .835.555 1.51 1.24 1.51.684 0 1.24-.675 1.24-1.51 0-.834-.556-1.51-1.24-1.51zm11.388 0c-.685 0-1.24.676-1.24 1.51 0 .835.555 1.51 1.24 1.51.684 0 1.24-.675 1.24-1.51 0-.834-.556-1.51-1.24-1.51z" />
  </svg>
);

export interface SocialPlatform {
  icon: React.ReactNode;
  color: string;
  label: string;
}

export const getSocialIcon = (platform: string, icon?: string | null): SocialPlatform => {
  const iconProps = { className: "w-5 h-5" };
  
  // 1. 如果 icon 是 SVG 字符串（以 < 开头），直接渲染
  if (icon && icon.trim().startsWith('<')) {
    return {
      icon: <span className="flex items-center justify-center w-5 h-5" dangerouslySetInnerHTML={{ __html: icon }} />,
      color: 'text-foreground', // 默认颜色
      label: platform
    };
  }

  // 2. 规范化平台名称
  const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '');
  const key = normalize(icon || platform);

  // 3. 匹配平台并返回图标和品牌色
  if (key.includes('github')) {
    return {
      icon: <Github {...iconProps} />,
      color: 'text-[#24292f] dark:text-[#ffffff]', // GitHub 官方黑/白
      label: 'GitHub'
    };
  }
  
  if (key.includes('twitter') || key === 'x') {
    return {
      icon: <XIcon {...iconProps} />,
      color: 'text-[#000000] dark:text-[#ffffff]', // X 黑/白
      label: 'X'
    };
  }
  
  if (key.includes('linkedin')) {
    return {
      icon: <Linkedin {...iconProps} />,
      color: 'text-[#0077b5]', // LinkedIn 蓝
      label: 'LinkedIn'
    };
  }
  
  if (key.includes('mail') || key.includes('email')) {
    return {
      icon: <Mail {...iconProps} />,
      color: 'text-[#5f6368] dark:text-[#e8eaed]', // 邮箱灰
      label: 'Email'
    };
  }
  
  if (key.includes('youtube')) {
    return {
      icon: <Youtube {...iconProps} />,
      color: 'text-[#ff0000]', // YouTube 红
      label: 'YouTube'
    };
  }
  
  if (key.includes('instagram')) {
    return {
      icon: <Instagram {...iconProps} />,
      color: 'text-[#e1306c]', // Instagram 粉红
      label: 'Instagram'
    };
  }
  
  if (key.includes('facebook')) {
    return {
      icon: <Facebook {...iconProps} />,
      color: 'text-[#1877f2]', // Facebook 蓝
      label: 'Facebook'
    };
  }
  
  if (key.includes('twitch')) {
    return {
      icon: <Twitch {...iconProps} />,
      color: 'text-[#9146ff]', // Twitch 紫
      label: 'Twitch'
    };
  }
  
  if (key.includes('bilibili')) {
    return {
      icon: <BilibiliIcon {...iconProps} />,
      color: 'text-[#00aeec]', // Bilibili 蓝
      label: 'Bilibili'
    };
  }
  
  if (key.includes('juejin')) {
    return {
      icon: <JuejinIcon {...iconProps} />,
      color: 'text-[#4096ff]', // 掘金蓝（调浅）
      label: '掘金'
    };
  }

  if (key.includes('blog') || key.includes('website') || key.includes('web')) {
    return {
      icon: <Globe {...iconProps} />,
      color: 'text-foreground',
      label: 'Website'
    };
  }
  
  if (key.includes('code') || key.includes('leetcode')) {
    return {
      icon: <Code2 {...iconProps} />,
      color: 'text-[#ffa116]', // LeetCode 黄
      label: 'LeetCode'
    };
  }
  
  if (key.includes('wechat')) {
    return {
      icon: <MessageCircle {...iconProps} />,
      color: 'text-[#07c160]', // WeChat 绿
      label: 'WeChat'
    };
  }

  // 默认
  return {
    icon: <ExternalLink {...iconProps} />,
    color: 'text-muted-foreground',
    label: platform
  };
};
