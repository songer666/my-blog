"use client";

import React, { useState, useRef } from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { TypingAnimation } from '@/components/shadcn/ui/typing-animation';
import { SocialLinks } from './social-links';
import homeConfig from './home.json';

const styles = {
  // Hero 容器 - 占满屏幕高度减去 navbar
  container: 'relative w-full min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-5rem)] min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden pt-20 lg:pt-0',
  
  // 背景装饰
  decoration: {
    circle1: `absolute top-20 -left-20 w-96 h-96 rounded-full 
      bg-purple-500/10 dark:bg-purple-500/5 blur-3xl animate-pulse`,
    circle2: `absolute bottom-20 -right-20 w-96 h-96 rounded-full 
      bg-pink-500/10 dark:bg-pink-500/5 blur-3xl animate-pulse`,
  },
  
  // 内容包装器
  wrapper: 'relative z-10 max-w-7xl mx-auto px-6 sm:px-8 w-full',
  
  // 网格布局
  grid: 'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center',
  
  // 左侧文字区域
  textArea: {
    container: 'flex flex-col gap-6 text-center lg:text-left',
    greeting: 'font-sans text-lg sm:text-xl text-muted-foreground',
    title: 'font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight',
    titleGradient: `bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
      dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 
      bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]`,
    subtitle: 'font-display text-xl sm:text-2xl text-foreground/80 text-center lg:text-left min-h-[2.5rem]',
    description: `font-sans text-base sm:text-lg text-muted-foreground leading-relaxed 
      max-w-xl mx-auto lg:mx-0`,
    buttons: 'flex flex-wrap gap-4 justify-center lg:justify-start mt-4',
    button: `px-6 py-3 rounded-full font-display font-medium transition-all duration-300
      bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600
      text-white shadow-lg hover:shadow-xl hover:scale-105`,
    buttonOutline: `px-6 py-3 rounded-full font-display font-medium transition-all duration-300
      border-2 border-purple-600 dark:border-purple-400 
      text-purple-600 dark:text-purple-400
      hover:bg-purple-600 dark:hover:bg-purple-500 hover:text-white
      hover:scale-105`,
  },
  
  // 右侧猫咪区域
  catArea: {
    container: 'relative flex items-center justify-center',
    wrapper: `relative w-full max-w-md mx-auto aspect-square
      transition-all duration-500`,
    // 发光效果
    glow: `absolute inset-0 rounded-full 
      bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20
      blur-3xl animate-pulse`,
    // 猫咪图片容器（使用 CSS 背景图切换）
    imageWrapper: `relative z-10 w-full h-full overflow-hidden
      bg-[url('/background/white.png')] dark:bg-[url('/background/black.png')]
      bg-contain bg-center bg-no-repeat
      drop-shadow-2xl transition-all duration-300 cursor-pointer`,
    // 鼠标光团
    mouseGlow: `absolute w-32 h-32 rounded-full pointer-events-none
      bg-gradient-to-r from-purple-500/40 via-pink-500/40 to-purple-500/40
      blur-2xl transition-opacity duration-300`,
  },
};

export function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!catRef.current) return;
    const rect = catRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <section className={styles.container}>
      {/* 装饰圆圈 */}
      <div className={styles.decoration.circle1} />
      <div className={styles.decoration.circle2} />
      
      <div className={styles.wrapper}>
        <div className={styles.grid}>
          {/* 左侧文字区域 */}
          <BlurFade delay={0.2} inView>
            <div className={styles.textArea.container}>
              <p className={styles.textArea.greeting}>
                {homeConfig.hero.greeting}
              </p>
              
              <h1 className={styles.textArea.title}>
                <span className={styles.textArea.titleGradient}>
                  {homeConfig.hero.name}
                </span>
              </h1>
              
              <TypingAnimation
                texts={homeConfig.hero.titles}
                duration={80}
                loop={true}
                pauseDuration={2000}
                className={styles.textArea.subtitle}
                as="p"
              />
              
              <p className={styles.textArea.description}>
                {homeConfig.hero.description}
              </p>
              
              {/* 社交链接 */}
              <SocialLinks />
              
              <div className={styles.textArea.buttons}>
                {homeConfig.hero.buttons.map((button) => (
                  <a
                    key={button.text}
                    href={button.href}
                    className={
                      button.variant === 'primary'
                        ? styles.textArea.button
                        : styles.textArea.buttonOutline
                    }
                  >
                    {button.text}
                  </a>
                ))}
              </div>
            </div>
          </BlurFade>
          
          {/* 右侧猫咪区域 */}
          <BlurFade delay={0.4} inView>
            <div className={styles.catArea.container}>
              <div className={styles.catArea.wrapper}>
                {/* 发光效果 */}
                <div className={styles.catArea.glow} />
                
                {/* 猫咪图片 - 使用 CSS 背景图自动切换 */}
                <div 
                  ref={catRef}
                  className={styles.catArea.imageWrapper}
                  role="img"
                  aria-label="气质猫咪"
                  onMouseMove={handleMouseMove}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {/* 鼠标光团 */}
                  <div
                    className={styles.catArea.mouseGlow}
                    style={{
                      left: `${mousePosition.x}px`,
                      top: `${mousePosition.y}px`,
                      transform: 'translate(-50%, -50%)',
                      opacity: isHovering ? 1 : 0,
                    }}
                  />
                </div>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}
