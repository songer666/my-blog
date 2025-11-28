import React from 'react';
import Link from 'next/link';
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

export function BackToList() {
  return (
    <div className={styles.container}>
      <Link href="/root/projects">
        <Button variant="ghost" className={styles.button}>
          <ArrowLeft className={styles.icon} />
          返回项目列表
        </Button>
      </Link>
    </div>
  );
}

