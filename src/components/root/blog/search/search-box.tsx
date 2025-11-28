import React from 'react';
import Form from 'next/form';
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
  return (
    <div className={styles.container}>
      <Form action={baseUrl} scroll={false} className={styles.form}>
        <Input
          type="text"
          name="keyword"
          placeholder="搜索博客标题、描述或关键词..."
          defaultValue={currentKeyword}
          className={styles.input}
        />
        <Button type="submit" variant="default" className={styles.button}>
          <Search className={styles.icon} />
          搜索
        </Button>
      </Form>
    </div>
  );
}
