'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shadcn/ui/button';
import { ArrowLeft } from 'lucide-react';

const styles = {
  container: 'mb-4',
  button: `gap-2 font-sans cursor-pointer
    text-purple-600 hover:text-purple-700 
    dark:text-purple-400 dark:hover:text-purple-300 
    border-purple-300/50 dark:border-purple-600/30 
    hover:bg-purple-50/30 dark:hover:bg-purple-950/10 
    transition-all duration-200`.trim(),
  icon: 'w-4 h-4',
};

interface BackToListProps {
  href: string;
  label: string;
}

export function BackToList({ href, label }: BackToListProps) {
  const router = useRouter();

  const handleBack = () => {
    // 检查是否有历史记录
    if (window.history.length > 1) {
      router.back(); // 使用浏览器缓存，瞬间返回
    } else {
      router.push(href); // 如果没有历史记录，直接跳转到指定页面
    }
  };

  return (
    <div className={styles.container}>
      <Button 
        variant="ghost" 
        className={styles.button}
        onClick={handleBack}
      >
        <ArrowLeft className={styles.icon} />
        {label}
      </Button>
    </div>
  );
}
