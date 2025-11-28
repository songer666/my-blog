import React from 'react';
import Image from 'next/image';
import { MdxHydrate } from '@/components/mdx/hydrate';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { cn } from '@/lib/utils';
import { getSocialIcon } from '@/lib/icon-utils';

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
    container: 'flex flex-wrap gap-2 items-center justify-center',
    link: 'inline-flex items-center justify-center p-2 rounded-lg hover:bg-muted transition-colors',
    icon: 'text-lg flex items-center justify-center w-5 h-5',
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
            const { icon, color, label } = getSocialIcon(link.platform, link.icon);
            const isEmail = label === 'Email' || link.platform.toLowerCase().includes('mail');
            
            // 处理邮箱链接
            let href = link.url;
            if (isEmail && !href.startsWith('mailto:')) {
              href = `mailto:${href}`;
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
                    <span className={cn(styles.links.icon, color)}>
                      {icon}
                    </span>
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

