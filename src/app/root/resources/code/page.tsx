import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { CodeCard } from '@/components/root/resources/code/code-card';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { generateCodeListMetadata } from './metadata';

// 强制静态生成（SSG）
export const dynamic = 'force-static';

// 生成页面 metadata
export async function generateMetadata(
  props: any,
  parent: any
) {
  return await generateCodeListMetadata(parent);
}

const pageStyles = {
  container: 'w-full pt-20 sm:pt-24',
  subContainer: 'p-6 max-w-7xl mx-auto flex flex-col gap-6',
  dividerContainer: 'relative w-full h-px max-w-7xl mx-auto mt-8 mb-0 z-20 overflow-visible',
  divider: 'absolute inset-0 bg-border hover:h-[2px] hover:-translate-y-[0.5px] transition-all duration-200',
  innerContainer: 'max-w-6xl mx-auto px-6 sm:px-12 xl:px-2',
  header: {
    container: 'max-w-6xl px-6 flex flex-col gap-2',
    title: `text-4xl md:text-4xl font-semibold tracking-tighter font-sans 
      text-violet-500 dark:text-violet-500 
      drop-shadow-[0_2px_4px_rgba(139,92,246,0.15)]`.trim(),
    subtitle: 'text-sm text-muted-foreground/80 font-sans flex items-center gap-1.5',
    description: 'text-muted-foreground text-sm md:text-base font-sans text-left',
  },
  grid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4',
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
};

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function CodeResourcesPage() {
  const queryClient = getQueryClient();
  const repositories = await queryClient.fetchQuery(
    trpc.codeRepository.allPublic.queryOptions()
  );

  return (
    <div className={pageStyles.container}>
      {/* Header */}
      <BlurFade delay={0.1} inView>
        <div className={pageStyles.subContainer}>
          <div className={pageStyles.header.container}>
            <h1 className={pageStyles.header.title}>代码库</h1>
            <p className={pageStyles.header.description}>
              实用代码片段与工具集合
            </p>
          </div>
        </div>
      </BlurFade>

      {/* BorderBeam 分隔线 */}
      <div className={pageStyles.dividerContainer}>
        <div className={pageStyles.divider} />
        <BorderBeam 
          size={200}
          duration={8}
          delay={0}
          colorFrom="#8b5cf6"
          colorTo="#a78bfa"
          borderWidth={1}
        />
      </div>

      {/* List */}
      <BlurFade delay={0.3} inView>
        <div className={pageStyles.innerContainer} style={{ marginTop: '3rem' }}>
          {repositories.length === 0 ? (
            <div className={pageStyles.empty.container}>
              <p className={pageStyles.empty.title}>暂无代码库</p>
              <p className={pageStyles.empty.subtitle}>更多精彩内容正在准备中...</p>
            </div>
          ) : (
            <div className={pageStyles.grid}>
              {repositories.map((repo, index) => (
                <BlurFade key={repo.id} delay={0.15 + index * 0.05} inView>
                  <CodeCard
                    id={repo.id}
                    title={repo.title}
                    slug={repo.slug}
                    description={repo.description}
                    keywords={repo.keywords}
                    itemCount={repo.itemCount}
                    createdAt={repo.createdAt}
                    index={index}
                  />
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </BlurFade>
    </div>
  );
}
