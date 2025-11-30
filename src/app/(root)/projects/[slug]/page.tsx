import React from 'react';
import { notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { BackToList } from '@/components/root/projects/item/back-to-list';
import { ProjectHeader } from '@/components/root/projects/item/project-header';
import { ProjectContent } from '@/components/root/projects/item/project-content';
import { generateProjectSlugMetadata } from './metadata';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';

// 页面样式（增加 padding-top 避免与固定 navbar 重叠）
const pageStyles = {
  container: 'container mx-auto px-4 py-8 max-w-6xl pt-20 sm:pt-24',
  dividerContainer: 'relative w-full h-px max-w-6xl mx-auto mt-3 mb-8',
  divider: 'absolute inset-0 bg-border',
};

interface ProjectSlugPageProps {
  params: Promise<{ slug: string }>;
}

// 强制静态生成（SSG）
export const dynamic = 'force-static';

// 生成页面 metadata
export async function generateMetadata(
  { params }: ProjectSlugPageProps,
  parent: any
) {
  const { slug } = await params;
  return await generateProjectSlugMetadata(slug, parent);
}

export default async function ProjectSlugPage({ params }: ProjectSlugPageProps) {
  const { slug } = await params;

  // 获取项目详情
  const queryClient = getQueryClient();
  const projectResponse = await queryClient.fetchQuery(
    trpc.project.getPublicProjectBySlug.queryOptions({ slug })
  );

  // 如果项目不存在，返回404
  if (!projectResponse.success || !projectResponse.data) {
    notFound();
  }

  const project = projectResponse.data;

  return (
    <div className={pageStyles.container}>
      {/* 返回列表按钮 */}
      <BackToList />

      {/* 项目头部 */}
      <ProjectHeader
        title={project.title}
        description={project.description}
        image={project.image}
        keyWords={project.keyWords}
        githubUrl={project.githubUrl}
        demoUrl={project.demoUrl}
        createdAt={project.createdAt}
        updatedAt={project.updatedAt}
        showDivider={false}
      />

      {/* BorderBeam 分隔线 */}
      <div className={pageStyles.dividerContainer}>
        <div className={pageStyles.divider} />
        <BorderBeam 
          size={200}
          duration={8}
          delay={0}
          colorFrom="#a855f7"
          colorTo="#ec4899"
          borderWidth={1}
        />
      </div>

      {/* 项目内容 */}
      <ProjectContent content={project.content} />

      {/* 底部返回按钮 */}
      <BackToList />
    </div>
  );
}
