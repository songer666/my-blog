import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { ProjectContent } from '@/components/admin/project/content/project-content';
import { ProjectDelete } from '@/components/admin/project/delete/project-delete';
import { ToggleVisible } from '@/components/admin/project/toggle/toggle-visible';
import { LinkCodeRepositoryWrapper } from '@/components/admin/project/code-link/link-code-repository-wrapper';
import { Card, CardContent } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { RevalidateButton } from '@/components/isr';
import { notFound } from 'next/navigation';
import { serializeMdx } from '@/components/mdx/utils';
import styles from './page.module.css';

// Admin 页面需要认证，保持动态渲染

export default async function ProjectIdPage({
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
  
  // 序列化 MDX 内容
  const serializedContent = await serializeMdx(project.content);

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/dashboard">
            <Button variant="outline" size="sm" className="cursor-pointer flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              返回首页
            </Button>
          </Link>
        </div>
        <div className={styles.headerRight}>
          <RevalidateButton type="projects" label="刷新项目列表" size="sm" />
          <RevalidateButton type="project-detail" slug={project.slug} label="刷新当前页面" size="sm" />
          <LinkCodeRepositoryWrapper project={project} />
          <ToggleVisible project={project} />
          <ProjectDelete project={project} />
        </div>
      </div>

      {/* 项目内容 */}
      <Card className={styles.contentCard}>
        <CardContent className={styles.contentWrapper}>
          <ProjectContent project={project} serializedContent={serializedContent} />
        </CardContent>
      </Card>
    </div>
  );
}
