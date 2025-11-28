"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/shadcn/ui/skeleton";
import { codeToHtml } from 'shiki';

const styles = {
  wrapper: `text-xs sm:text-sm rounded-md w-full`.trim(),
  codeBlockStyle: {
    fontSize: 'inherit',
    borderRadius: '0.375rem',
    width: '100%',
    maxWidth: '100%',
  } as React.CSSProperties,
  error: `text-xs sm:text-sm text-destructive p-2 sm:p-4 border border-destructive/20 rounded-md bg-destructive/10`.trim(),
  loading: `space-y-2 p-2 sm:p-4`.trim(),
};

interface CodeViewerProps {
  content: string; // 直接接收代码内容
  language?: string;
  wrapMode?: boolean; // 是否自动换行，默认 false（溢出滚动）
}

export function CodeViewer({ content, language, wrapMode = false }: CodeViewerProps) {
  const [highlightedCode, setHighlightedCode] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  // 监控 dark class 变化
  useEffect(() => {
    const updateTheme = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDark(dark);
    };

    // 初始检测
    updateTheme();

    // 监听 class 变化
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const highlightCode = async () => {
      try {
        setLoading(true);
        setError(null);

        // 检查内容是否为空
        if (!content) {
          setError('代码内容为空（可能是旧数据，请重新上传）');
          setLoading(false);
          return;
        }


        // 使用 shiki 进行代码高亮
        const langMap: Record<string, string> = {
          'JavaScript': 'javascript',
          'TypeScript': 'typescript',
          'Python': 'python',
          'Java': 'java',
          'C++': 'cpp',
          'C': 'c',
          'C#': 'csharp',
          'Go': 'go',
          'Rust': 'rust',
          'Ruby': 'ruby',
          'PHP': 'php',
          'Swift': 'swift',
          'Kotlin': 'kotlin',
          'Dart': 'dart',
          'HTML': 'html',
          'CSS': 'css',
          'SCSS': 'scss',
          'JSON': 'json',
          'XML': 'xml',
          'YAML': 'yaml',
          'Markdown': 'markdown',
          'SQL': 'sql',
          'Shell': 'bash',
          'Bash': 'bash',
        };

        const shikiLang = language ? langMap[language] || 'text' : 'text';
        const selectedTheme = isDark ? 'github-dark' : 'github-light';

        const html = await codeToHtml(content, {
          lang: shikiLang,
          theme: selectedTheme,
        });

        setHighlightedCode(html);
      } catch (err: any) {
        console.error('代码高亮失败:', err);
        setError(err.message || '代码高亮失败');
      } finally {
        setLoading(false);
      }
    };

    highlightCode();
  }, [content, language, isDark]);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        错误: {error}
      </div>
    );
  }

  return (
    <div 
      className={`${wrapMode ? 'code-viewer-wrap' : 'code-viewer-overflow'} ${styles.wrapper}`}
      style={styles.codeBlockStyle}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}
