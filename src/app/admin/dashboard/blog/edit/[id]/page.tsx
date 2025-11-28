import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { TagList } from '@/server/types/blog-type';
import { PostEditWrapper } from '@/components/admin/blog/edit/post-edit-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Edit } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

interface EditBlogIdPageProps {
  params: Promise<{ id: string }>;
}

// Admin 页面需要认证，保持动态渲染

export default async function EditBlogIdPage({ params }: EditBlogIdPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  
  // 并行获取文章数据、标签数据和代码库数据
  const [postResult, tagsResult, repositoriesResult] = await Promise.all([
    queryClient.fetchQuery(trpc.post.getById.queryOptions({ id })).catch(() => ({ success: false, message: '获取文章数据失败' })),
    queryClient.fetchQuery(trpc.tag.getAll.queryOptions()).catch(() => ({ success: false, data: [] })),
    queryClient.fetchQuery(trpc.codeRepository.all.queryOptions()).catch(() => [])
  ]);
  
  const postData = (postResult.success && 'data' in postResult) ? postResult.data : null;
  const tags: TagList = tagsResult.success ? (tagsResult.data || []) : [];
  const repositories = Array.isArray(repositoriesResult) ? repositoriesResult.map(r => ({
    id: r.id,
    title: r.title,
    slug: r.slug
  })) : [];
  
  if (!postResult.success || !postData) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>
            {postResult.message || '文章不存在'}
          </h1>
          <p className={styles.errorDescription}>
            请检查文章ID是否正确，或者文章可能已被删除。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>编辑文章</h1>
          <p className={styles.subtitle}>
            修改文章 "{postData.title}" 的内容
          </p>
        </div>
      </div>

      {/* 编辑表单 */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formHeader}>
          <div className={styles.cardHeaderContent}>
            <CardTitle className={styles.formTitle}>
              <Edit className={styles.formIcon} />
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
            mode="edit"
            initialData={postData}
            availableTags={tags}
            availableRepositories={repositories}
          />
        </CardContent>
      </Card>
    </div>
  );
}