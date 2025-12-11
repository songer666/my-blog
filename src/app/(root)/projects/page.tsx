import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { ProjectList } from '@/components/root/projects/card/project-list';
import { generateProjectsListMetadata } from './metadata';

// 强制静态生成（SSG）
export const dynamic = 'force-static';

// 页面样式（增加 padding-top 避免与固定 navbar 重叠）
const pageStyles = {
  container: 'w-full pt-20 sm:pt-24',
  subContainer: 'p-6 max-w-7xl mx-auto flex flex-col gap-6',
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  header: {
    container: 'max-w-6xl px-6 flex flex-col gap-2',
    title: `font-display text-4xl md:text-4xl font-semibold tracking-tighter 
      text-violet-500 dark:text-violet-500 
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`.trim(),
    subtitle: 'text-sm text-muted-foreground/80 font-sans flex items-center gap-1.5',
    description: 'text-muted-foreground text-sm md:text-base font-sans text-left',
  },
};

// 生成页面 metadata
export async function generateMetadata(
  props: any,
  parent: any
) {
  return await generateProjectsListMetadata(parent);
}

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function ProjectsPage() {
  // 获取所有项目列表
  const queryClient = getQueryClient();
  const projectsResponse = await queryClient.fetchQuery(
    trpc.project.getAllPublicProjects.queryOptions()
  );

  const projects = projectsResponse.data || [];

  return (
    <div className={pageStyles.container}>
      {/* 页面标题和过滤器 */}
        <div className={pageStyles.subContainer}>
          <div className={pageStyles.header.container}>
            <h1 className={pageStyles.header.title}>项目</h1>
            <p className={pageStyles.header.description}>
              创意与实践的结晶
            </p>
          </div>
        </div>

      {/* 项目列表 */}
        <div className={pageStyles.innerContainer} style={{ marginTop: '3rem' }}>
          <ProjectList projects={projects} />
        </div>

    </div>
  );
}
