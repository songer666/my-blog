import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { PostEditWrapper } from '@/components/admin/blog/edit/post-edit-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { TagList } from '@/server/types/blog-type';
import styles from './page.module.css';

// Admin 页面需要认证，保持动态渲染

export default async function BlogCreatePage() {
  const queryClient = getQueryClient();
  // 并行获取所有标签和代码库数据
  const [tagsResult, repositoriesResult] = await Promise.all([
    queryClient.fetchQuery(trpc.tag.getAll.queryOptions()),
    queryClient.fetchQuery(trpc.codeRepository.all.queryOptions()).catch(() => [])
  ]);
  const tags = tagsResult.data || [];
  
  const repositories = Array.isArray(repositoriesResult) ? repositoriesResult.map(r => ({
    id: r.id,
    title: r.title,
    slug: r.slug
  })) : [];

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>创建新文章</h1>
          <p className={styles.subtitle}>
            编写并发布您的博客文章
          </p>
        </div>
      </div>

      {/* 编辑表单 */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formHeader}>
          <div className={styles.cardHeaderContent}>
            <CardTitle className={styles.formTitle}>
              <Plus className={styles.formIcon} />
              文章信息
            </CardTitle>
            <Link href="/admin/dashboard/blog">
              <Button variant="outline" className="cursor-pointer">
                取消
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className={styles.formContent}>
          <PostEditWrapper
            mode="create"
            availableTags={tags}
            availableRepositories={repositories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
