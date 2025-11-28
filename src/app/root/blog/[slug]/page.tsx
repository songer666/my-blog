import React from 'react';
import { notFound } from 'next/navigation';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { BackToList } from '@/components/root/blog/item/back-to-list';
import { BlogHeader } from '@/components/root/blog/item/blog-header';
import { BlogContent } from '@/components/root/blog/item/blog-content';
import { generateBlogDetailMetadata } from './metadata';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shadcn/ui/tabs';
import { CodeBrowser } from '@/components/admin/resources/code/browser/code-browser';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';

// 强制静态生成（SSG）
export const dynamic = 'force-static';

// 页面样式（增加 padding-top 避免与固定 navbar 重叠）
const pageStyles = {
  container: 'container mx-auto px-4 py-8 max-w-6xl pt-20 sm:pt-24',
  tabs: {
    root: 'mb-4',
    list: `w-fit bg-secondary dark:bg-muted/50 
      border border-border dark:border-border/50 
      p-1 rounded-lg`.trim(),
    trigger: `px-6 py-2 rounded-md
      data-[state=active]:bg-background data-[state=active]:shadow-sm
      dark:data-[state=active]:bg-background
      data-[state=active]:text-foreground dark:data-[state=active]:text-purple-400
      text-muted-foreground
      hover:text-foreground dark:hover:text-purple-400 
      hover:bg-background/50 dark:hover:bg-background/50
      transition-all duration-200`.trim(),
    content: 'mt-6',
  },
  dividerContainer: 'relative w-full h-px max-w-6xl mx-auto mt-3 mb-3',
  divider: 'absolute inset-0 bg-border hover:h-[2px] hover:-translate-y-[0.5px] transition-all duration-200',
};

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

// 生成页面 metadata
export async function generateMetadata(
  { params }: BlogPostPageProps,
  parent: any
) {
  const { slug } = await params;
  return await generateBlogDetailMetadata(slug, parent);
}

export default async function BlogPostPageSlug({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // 获取文章详情
  const queryClient = getQueryClient();
  const postResponse = await queryClient.fetchQuery(
    trpc.post.getPublicPostBySlug.queryOptions({ slug })
  );

  // 如果文章不存在，返回404
  if (!postResponse.success || !postResponse.data) {
    notFound();
  }

  const post = postResponse.data;
  
  // 如果有关联的代码库，获取代码库详情
  let codeRepository = null;
  if (post.relatedCodeRepositoryId) {
    try {
      const codeRepoResponse = await queryClient.fetchQuery(
        trpc.codeRepository.byId.queryOptions({ id: post.relatedCodeRepositoryId })
      );
      if (codeRepoResponse) {
        codeRepository = codeRepoResponse;
      }
    } catch (error) {
      console.error('获取代码库失败:', error);
    }
  }

  return (
    <div className={pageStyles.container}>
      {/* 文章头部 */}
      <BlogHeader
        title={post.title}
        description={post.description}
        image={post.image}
        keyWords={post.keyWords}
        createdAt={post.createdAt}
        updatedAt={post.updatedAt}
        showDivider={false}
      />

      {/* Tabs: 内容和代码 */}
      <Tabs defaultValue="content" className={pageStyles.tabs.root}>
        {/* TabsList 在分割线上方 */}
        <TabsList className={pageStyles.tabs.list}>
          <TabsTrigger value="content" className={pageStyles.tabs.trigger}>内容</TabsTrigger>
          {codeRepository && codeRepository.items && codeRepository.items.length > 0 && (
            <TabsTrigger value="code" className={pageStyles.tabs.trigger}>代码</TabsTrigger>
          )}
        </TabsList>

        {/* BorderBeam 分隔线 */}
        <div className={`${pageStyles.dividerContainer} z-20 overflow-visible`}>
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

        {/* Tab 内容 */}
        <TabsContent value="content" className={pageStyles.tabs.content}>
          <BlogContent content={post.content} />
        </TabsContent>
        
        {codeRepository && codeRepository.items && codeRepository.items.length > 0 && (
          <TabsContent value="code" className={pageStyles.tabs.content}>
            <CodeBrowser files={codeRepository.items} />
          </TabsContent>
        )}
      </Tabs>

      {/* 底部返回按钮 */}
      <BackToList />
    </div>
  );
}
