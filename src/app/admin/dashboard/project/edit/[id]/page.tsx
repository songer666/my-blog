import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { ProjectSaveWrapper } from '@/components/admin/project/save/project-save-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Edit, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import styles from './page.module.css';

// Admin 页面需要认证，保持动态渲染

export default async function EditProjectIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
    const id = (await params)?.id
  const queryClient = getQueryClient();
  // 获取项目数据
  const result = await queryClient.fetchQuery(trpc.project.getById.queryOptions({ id }));
  
  if (!result.success || !result.data) {
    notFound();
  }

  const project = result.data;

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>编辑项目</h1>
          <p className={styles.subtitle}>
            修改项目信息并保存更改
          </p>
        </div>
        <Link href={`/admin/dashboard/project/${id}`}>
          <Button variant="outline" className="cursor-pointer flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            返回详情
          </Button>
        </Link>
      </div>

      {/* 编辑表单 */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formHeader}>
          <div className={styles.cardHeaderContent}>
            <CardTitle className={styles.formTitle}>
              <Edit className={styles.formIcon} />
              项目信息
            </CardTitle>
            <Link href={`/admin/dashboard/project/${id}`}>
              <Button variant="outline" className="cursor-pointer">
                取消
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className={styles.formContent}>
          <ProjectSaveWrapper
            mode="edit"
            initialData={project}
          />
        </CardContent>
      </Card>
    </div>
  );
}
