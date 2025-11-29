'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  currentKeyword?: string;
  baseUrl: string;
}

const styles = {
  container: '',
  form: 'flex gap-3 max-w-2xl',
  input: `flex-1 font-sans transition-colors`.trim(),
  button: `font-sans cursor-pointer 
    dark:bg-purple-500/80 dark:hover:bg-purple-600/80`.trim(),
  icon: 'w-4 h-4 mr-2',
};

export function SearchBox({ currentKeyword, baseUrl }: SearchBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(currentKeyword || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    // 移除page参数
    params.delete('page');
    
    // 更新或删除keyword参数
    if (keyword.trim()) {
      params.set('keyword', keyword.trim());
    } else {
      params.delete('keyword');
    }
    
    const queryString = params.toString();
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    router.push(url);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.form}>
        <Input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜索博客标题、描述或关键词..."
          className={styles.input}
        />
        <Button type="submit" variant="default" className={styles.button}>
          <Search className={styles.icon} />
          搜索
        </Button>
      </form>
    </div>
  );
}
