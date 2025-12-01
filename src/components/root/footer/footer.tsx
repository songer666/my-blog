"use client";

import React from 'react';
import Link from 'next/link';
import { Github, Mail } from 'lucide-react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import footerConfig from './footer.json';
import homeConfig from '../home/home.json';

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

const styles = {
  footer: `relative w-full border-t border-border/50 
    bg-gradient-to-b from-background to-muted/20 mt-16 sm:mt-20 lg:mt-24`,
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-16',
  
  // 主要内容区域 - 移动端和平板都是三列,桌面4列
  mainContent: `grid grid-cols-3 lg:grid-cols-4 
    gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-10 lg:mb-12`,
  
  // 品牌区域 - 移动端和平板占满宽度,桌面占1列
  brandSection: 'col-span-3 lg:col-span-1 text-center sm:text-left',
  brandName: `font-display text-lg sm:text-2xl font-bold mb-2 sm:mb-3
    bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
    dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 
    bg-clip-text text-transparent`,
  brandDescription: 'text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 sm:mb-6',
  
  // 社交链接 - 移动端居中,桌面左对齐
  socialLinks: 'flex items-center gap-2 sm:gap-3 justify-center sm:justify-start',
  socialLink: `inline-flex items-center justify-center w-9 h-9 sm:w-9 sm:h-9 rounded-full
    border border-border/50 bg-background/50
    transition-all duration-300
    hover:scale-110 hover:shadow-lg hover:border-purple-400/50
    hover:bg-purple-50/50 dark:hover:bg-purple-950/30
    active:scale-95`,
  socialIcon: 'w-4 h-4 transition-colors duration-300',
  
  // 链接列区域 - 移动端居中,桌面左对齐
  linksSection: 'space-y-2 sm:space-y-4 text-center sm:text-left',
  linkTitle: 'font-display font-semibold text-foreground text-sm sm:text-base mb-2 sm:mb-4',
  linkList: 'space-y-1.5 sm:space-y-2.5',
  linkItem: `text-xs sm:text-sm text-muted-foreground transition-all duration-200
    hover:text-purple-600 dark:hover:text-purple-400
    sm:hover:translate-x-1 inline-block`,
  
  // 底部区域 - 响应式间距和对齐
  bottomSection: `pt-6 sm:pt-8 border-t border-border/50 
    flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-2 sm:gap-4
    text-center`,
  copyright: 'text-xs sm:text-sm text-muted-foreground',
  beianLinks: 'flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground',
  beianLink: 'hover:text-purple-600 dark:hover:text-purple-400 transition-colors',
  
  // 装饰元素
  decoration: `absolute top-0 right-0 w-64 h-64 
    bg-gradient-to-br from-purple-500/5 to-pink-500/5 
    rounded-full blur-3xl pointer-events-none`,
};

export function Footer() {
  // 社交链接映射
  const socialLinks = homeConfig.social.map((link) => ({
    ...link,
    icon: iconMap[link.icon as keyof typeof iconMap],
  }));

  return (
    <footer className={styles.footer}>
      {/* 装饰元素 */}
      <div className={styles.decoration} />
      
      <div className={styles.container}>
        <div className={styles.mainContent}>
          {/* 品牌和社交区域 - 移动端和平板占满宽度 */}
          <BlurFade delay={0.1} inView className={styles.brandSection}>
            <div>
              <h3 className={styles.brandName}>
                {footerConfig.site.name}
              </h3>
              <p className={styles.brandDescription}>
                {footerConfig.site.description}
              </p>
              
              {/* 社交链接 */}
              <div className={styles.socialLinks}>
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  if (!Icon) return null;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.socialLink}
                      aria-label={link.name}
                    >
                      <Icon className={`${styles.socialIcon} ${link.color}`} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </BlurFade>
          
          {/* 链接列 */}
          {footerConfig.links.map((section, index) => (
            <BlurFade 
              key={section.title} 
              delay={0.2 + index * 0.1} 
              inView 
              className={styles.linksSection}
            >
              <div>
                <h4 className={styles.linkTitle}>{section.title}</h4>
                <ul className={styles.linkList}>
                  {section.items.map((item) => (
                    <li key={item.text}>
                      <Link 
                        href={item.href}
                        className={styles.linkItem}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </BlurFade>
          ))}
        </div>
        
        {/* 底部版权信息 */}
        <BlurFade delay={0.5} inView>
          <div className={styles.bottomSection}>
            <p className={styles.copyright}>
              {footerConfig.site.copyright}
            </p>
            <div className={styles.beianLinks}>
              <a 
                href="https://beian.miit.gov.cn/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.beianLink}
              >
                {footerConfig.site.icp}
              </a>
              <a 
                href="http://www.beian.gov.cn/portal/registerSystemInfo" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.beianLink}
              >
                {footerConfig.site.beian}
              </a>
            </div>
          </div>
        </BlurFade>
      </div>
    </footer>
  );
}
