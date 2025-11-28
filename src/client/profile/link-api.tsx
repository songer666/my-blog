import { useMutation } from "@tanstack/react-query";
import {useTRPC} from "@/components/trpc/client";

/**
 * TRPC Hook 工具函数
 * 用于在 React 组件中获取社交链接相关的 mutations
 */
export function useLinkAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 新增社交链接的 mutation hook
     */
    useCreateSocialLink: () => useMutation(trpc.link.create.mutationOptions()),
    
    /**
     * 更新社交链接的 mutation hook
     */
    useUpdateSocialLink: () => useMutation(trpc.link.update.mutationOptions()),
    
    /**
     * 删除社交链接的 mutation hook
     */
    useDeleteSocialLink: () => useMutation(trpc.link.delete.mutationOptions()),
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 常用社交平台配置
 */
// 平台配置类型
type PlatformConfig = {
  name: string;
  icon: string;
  iconType: "lucide" | "custom" | "svg";
  iconSrc?: string;
  svgPath?: string;
  placeholder: string;
  urlPattern: RegExp;
  color: string;
  isContact?: boolean;
};

export const SOCIAL_PLATFORMS: PlatformConfig[] = [
  {
    name: "GitHub",
    icon: "Github",
    iconType: "lucide",
    placeholder: "https://github.com/username",
    urlPattern: /^https:\/\/(www\.)?github\.com\/.+/,
    color: "#181717",
  },
  {
    name: "微信",
    icon: "MessageCircle",
    iconType: "lucide",
    placeholder: "微信号：your_wechat_id",
    urlPattern: /^微信号：.+/,
    color: "#07C160",
    isContact: true,
  },
  {
    name: "邮箱",
    icon: "Mail",
    iconType: "lucide",
    placeholder: "your@email.com",
    urlPattern: /^(mailto:)?[^\s@]+@[^\s@]+\.[^\s@]+$/,
    color: "#EA4335",
    isContact: true,
  },
  {
    name: "CSDN",
    icon: "Code",
    iconType: "lucide",
    placeholder: "https://blog.csdn.net/username",
    urlPattern: /^https:\/\/blog\.csdn\.net\/.+/,
    color: "#FC5531",
  },
  {
    name: "LinkedIn",
    icon: "Linkedin",
    iconType: "lucide",
    placeholder: "https://www.linkedin.com/in/username",
    urlPattern: /^https:\/\/(www\.)?linkedin\.com\/in\/.+/,
    color: "#0A66C2",
  },
  {
    name: "Twitter",
    icon: "Twitter",
    iconType: "lucide",
    placeholder: "https://twitter.com/username",
    urlPattern: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/.+/,
    color: "#1DA1F2",
  },
  {
    name: "微博",
    icon: "MessageSquare",
    iconType: "lucide",
    placeholder: "https://weibo.com/username",
    urlPattern: /^https:\/\/(www\.)?weibo\.com\/.+/,
    color: "#E6162D",
  },
  {
    name: "掘金",
    icon: "custom",
    iconType: "svg",
    svgPath: `<path d="M12 2L16 5L12 8L8 5Z" /><path d="M12 11.5L17 7L20 7L12 14.5L4 7L7 7Z" /><path d="M12 19.5L17 15L20 15L12 22.5L4 15L7 15Z" />`,
    placeholder: "https://juejin.cn/user/userid",
    urlPattern: /^https:\/\/juejin\.cn\/user\/.+/,
    color: "#4096ff",
  },
  {
    name: "Bilibili",
    icon: "Youtube", // Fallback
    iconType: "svg",
    svgPath: `<path d="M17.813 4.653h.854c1.51.054 2.769.31 3.737 1.278.969.968 1.224 2.226 1.278 3.737v8.662c-.054 1.51-.31 2.769-1.278 3.737-.968.969-2.226 1.224-3.737 1.278H5.333c-1.51-.054-2.769-.31-3.737-1.278-.969-.968-1.224-2.226-1.278-3.737V9.668c.054-1.51.31-2.769 1.278-3.737.968-.969 2.226-1.224 3.737-1.278h.853l2.88-3.02a.81.81 0 01.818-.23.81.81 0 01.55.54.806.806 0 01-.16.84l-2.54 2.66h8.363l-2.54-2.66a.805.805 0 01-.16-.84.81.81 0 011.368-.31l2.88 3.02zM6.306 11.628c-.685 0-1.24.676-1.24 1.51 0 .835.555 1.51 1.24 1.51.684 0 1.24-.675 1.24-1.51 0-.834-.556-1.51-1.24-1.51zm11.388 0c-.685 0-1.24.676-1.24 1.51 0 .835.555 1.51 1.24 1.51.684 0 1.24-.675 1.24-1.51 0-.834-.556-1.51-1.24-1.51z" />`,
    placeholder: "https://space.bilibili.com/userid",
    urlPattern: /^https:\/\/(space|www)\.bilibili\.com\/.+/,
    color: "#00aeec",
  },
  {
    name: "博客园",
    icon: "Globe",
    iconType: "lucide",
    placeholder: "https://www.cnblogs.com/username",
    urlPattern: /^https:\/\/(www\.)?cnblogs\.com\/.+/,
    color: "#2E8B57",
  },
  {
    name: "YouTube",
    icon: "Youtube",
    iconType: "lucide",
    placeholder: "https://www.youtube.com/@username",
    urlPattern: /^https:\/\/(www\.)?youtube\.com\/.+/,
    color: "#FF0000",
  },
  {
    name: "个人网站",
    icon: "Home",
    iconType: "lucide",
    placeholder: "https://yourwebsite.com",
    urlPattern: /^https?:\/\/.+/,
    color: "#6366F1",
  },
];

/**
 * 根据平台名称获取平台配置
 */
export function getPlatformConfig(platformName: string) {
  return SOCIAL_PLATFORMS.find(p => p.name === platformName);
}

/**
 * 验证社交链接 URL 格式
 */
export function validateSocialLinkUrl(url: string, platform?: string): { valid: boolean; message?: string } {
  // 特殊处理联系方式
  if (platform === '微信' && url.startsWith('微信号：')) {
    return { valid: true };
  }
  
  if (platform === '邮箱') {
    // 如果用户直接输入邮箱地址，我们自动添加 mailto: 前缀
    let emailToValidate = url;
    if (!url.startsWith('mailto:')) {
      emailToValidate = url; // 直接验证邮箱格式
    } else {
      emailToValidate = url.replace('mailto:', '');
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      return {
        valid: false,
        message: '邮箱格式不正确',
      };
    }
    return { valid: true };
  }

  // 基本 URL 格式验证
  try {
    new URL(url);
  } catch {
    return {
      valid: false,
      message: 'URL 格式不正确',
    };
  }

  // 如果指定了平台，验证是否匹配
  if (platform) {
    const platformConfig = getPlatformConfig(platform);
    if (platformConfig && !platformConfig.urlPattern.test(url)) {
      return {
        valid: false,
        message: `URL 格式不符合 ${platform} 平台规范`,
      };
    }
  }

  return { valid: true };
}

/**
 * 生成社交链接的显示名称
 */
export function generateLinkDisplayName(platform: string, url: string): string {
  // 特殊处理联系方式
  if (platform === '微信' && url.startsWith('微信号：')) {
    return url.replace('微信号：', '');
  }
  
  if (platform === '邮箱' && url.startsWith('mailto:')) {
    return url.replace('mailto:', '');
  }

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    switch (platform) {
      case 'GitHub':
        return pathname.replace('/', '') || 'GitHub';
      case 'CSDN':
        const csdnMatch = pathname.match(/\/([^\/]+)/);
        return csdnMatch ? csdnMatch[1] : 'CSDN';
      case 'LinkedIn':
        const linkedinMatch = pathname.match(/\/in\/([^\/]+)/);
        return linkedinMatch ? linkedinMatch[1] : 'LinkedIn';
      case 'Twitter':
        return pathname.replace('/', '@') || 'Twitter';
      case '微博':
        const weiboMatch = pathname.match(/\/([^\/]+)/);
        return weiboMatch ? `@${weiboMatch[1]}` : '微博';
      case '掘金':
        return '掘金用户';
      case 'YouTube':
        const youtubeMatch = pathname.match(/\/@([^\/]+)/);
        return youtubeMatch ? `@${youtubeMatch[1]}` : 'YouTube';
      default:
        return urlObj.hostname || platform;
    }
  } catch {
    return platform;
  }
}
