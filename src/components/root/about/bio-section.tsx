import React from 'react';
import Image from 'next/image';
import { MdxHydrate } from '@/components/mdx/hydrate';
import { Github, Mail } from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { cn } from '@/lib/utils';
import {TikTokOutlined} from "@ant-design/icons";

// Bilibili 图标
const BilibiliIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" />
  </svg>
);

// 图标映射
const iconMap = {
  Github,
  douyin: TikTokOutlined,
  Mail,
  Bilibili: BilibiliIcon,
};

interface BioSectionProps {
  profile: {
    name: string;
    title: string;
    email: string;
    avatar?: string | null;
    avatarMimeType?: string | null;
  };
  serializedBio: any;
  socialLinks: Array<{
    id: string;
    platform: string;
    url: string;
    icon?: string | null;
  }>;
}

const styles = {
  container: 'flex flex-col',
  header: {
    container: 'flex flex-row gap-4 items-center mb-4',
    avatar: {
      wrapper: 'flex-shrink-0',
      container: 'relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-lg',
      image: 'w-full h-full object-cover',
    },
    info: {
      wrapper: 'flex-1',
      name: 'text-2xl md:text-3xl font-bold tracking-tighter font-sans text-foreground mb-1',
      title: 'text-base md:text-lg text-muted-foreground font-sans',
    },
  },
  divider: 'border-t border-dashed border-border mb-4',
  bio: {
    wrapper: 'prose prose-sm dark:prose-invert max-w-none mb-4 text-muted-foreground/80',
    container: '[&>div]:!flex [&>div]:!flex-col [&>div>div]:!w-full [&>div>div]:!max-w-none',
  },
  links: {
    container: 'flex flex-wrap gap-3 items-center justify-center',
    link: `inline-flex items-center justify-center w-10 h-10 rounded-full
      bg-background/50
      transition-all duration-300
      hover:scale-110 hover:shadow-lg
      hover:bg-purple-50/50 dark:hover:bg-purple-950/30`,
    icon: 'w-5 h-5 transition-colors duration-300',
    text: 'sr-only',
  },
};

export function BioSection({ profile, serializedBio, socialLinks }: BioSectionProps) {
  const isBase64Image = (src: string) => src.startsWith('data:image/');

  return (
    <div className={styles.container}>
      {/* 头部：头像和基本信息 */}
      <div className={styles.header.container}>
        {/* 头像 */}
        {profile.avatar && (
          <div className={styles.header.avatar.wrapper}>
            <div className={styles.header.avatar.container}>
              {isBase64Image(profile.avatar) ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className={styles.header.avatar.image}
                />
              ) : (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  className={styles.header.avatar.image}
                  sizes="(max-width: 768px) 96px, 128px"
                />
              )}
            </div>
          </div>
        )}

        {/* 姓名和标题 */}
        <div className={styles.header.info.wrapper}>
          <h1 className={styles.header.info.name}>
            {profile.name}
          </h1>
          <p className={styles.header.info.title}>
            {profile.title}
          </p>
        </div>
      </div>

      {/* 虚线分隔 */}
      <div className={styles.divider} />

      {/* Bio 描述内容 */}
      {serializedBio && (
        <div className={styles.bio.wrapper}>
          <div className={styles.bio.container}>
            <MdxHydrate serialized={serializedBio} toc={false} />
          </div>
        </div>
      )}

      {/* 社交链接 */}
      {socialLinks.length > 0 && (
        <div className={styles.links.container}>
          {socialLinks.map((link) => {
            // 获取图标组件
            const IconComponent = iconMap[link.platform as keyof typeof iconMap];
            if (!IconComponent) return null;

            // 处理邮箱链接
            const isEmail = link.platform.toLowerCase().includes('mail');
            let href = link.url;
            if (isEmail && !href.startsWith('mailto:')) {
              href = `mailto:${href}`;
            }

            // 根据平台设置颜色（与 home 页面保持一致）
            let color = '';
            switch (link.platform) {
              case 'Github':
                color = 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400';
                break;
              case 'douyin':
                color = 'text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300';
                break;
              case 'Bilibili':
                color = 'text-pink-500 hover:text-pink-600 dark:hover:text-pink-400';
                break;
              case 'Mail':
                color = 'text-red-500 hover:text-red-600 dark:hover:text-red-400';
                break;
              default:
                color = 'text-muted-foreground hover:text-foreground';
            }

            return (
              <Tooltip key={link.id} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.links.link}
                  >
                    <IconComponent className={cn(styles.links.icon, color)} />
                    <span className={styles.links.text}>{link.platform}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{link.platform}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}

