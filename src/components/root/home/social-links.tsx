"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Mail } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { cn } from '@/lib/utils';
import homeConfig from '@/../public/json/home.json';

// X (Twitter) 图标
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Bilibili 自定义图标组件
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
  X: XIcon,
  Mail,
  Bilibili: BilibiliIcon,
};

// 从配置文件读取社交链接
const socialLinks = homeConfig.social.map((link) => ({
  ...link,
  icon: iconMap[link.icon as keyof typeof iconMap],
}));

const styles = {
  container: 'flex items-center gap-3 justify-center lg:justify-start',
  link: `inline-flex items-center justify-center w-10 h-10 rounded-full
    border border-border/50 bg-background/50
    transition-all duration-300
    hover:scale-110 hover:shadow-lg hover:border-purple-400/50
    hover:bg-purple-50/50 dark:hover:bg-purple-950/30`,
  icon: 'w-5 h-5 transition-colors duration-300',
};

export function SocialLinks() {
  return (
    <div className={styles.container}>
      {socialLinks.map((link) => {
        const Icon = link.icon;
        if (!Icon) return null;
        return (
          <Tooltip key={link.name} delayDuration={0}>
            <TooltipTrigger asChild>
              <Link
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Icon className={cn(styles.icon, link.color)} />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{link.name}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
