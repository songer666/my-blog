import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { MdxRender } from '@/components/mdx/render';
import { 
  Calendar, 
  Tag as TagIcon, 
  Globe, 
  EyeOff,
  Clock,
  Hash,
  ArrowLeft,
  Edit,
  Code2
} from 'lucide-react';
import Link from 'next/link';
import { formatDateTime, cn } from '@/lib/utils';
import { notFound } from 'next/navigation';
import styles from './page.module.css';
import { extractR2KeysFromMDX } from '@/lib/mdx-r2-utils';
import { getBatchSignedUrlsAction } from '@/server/actions/resources/r2-action';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';

// Admin 页面需要认证，保持动态渲染

export default async function BlogIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const queryClient = getQueryClient();
  
  // 获取文章数据
  const result = await queryClient.fetchQuery(trpc.post.getById.queryOptions({ id }));
  
  if (!result.success || !result.data) {
    notFound();
  }
  
  const post = result.data;

  // 提取 MDX 中的所有 R2 keys 并批量获取预签名 URL
  const r2Keys = extractR2KeysFromMDX(post.content);
  let signedUrls: Record<string, string> = {};
  
  if (r2Keys.length > 0) {
    const urlResult = await getBatchSignedUrlsAction(r2Keys);
    if (urlResult.success && urlResult.signedUrls) {
      signedUrls = urlResult.signedUrls as Record<string, string>;
    }
  }

  return (
    <div className={styles.container}>
      {/* 顶部按钮栏 */}
      <div className={styles.buttonBar}>
        <Link href="/admin/dashboard/blog">
          <Button variant="outline" className={styles.backButton}>
            <ArrowLeft className={styles.buttonIcon} />
            返回文章列表
          </Button>
        </Link>
        
        <Link href={`/admin/dashboard/blog/edit/${post.id}`}>
          <Button className={styles.editButton}>
            <Edit className={styles.buttonIcon} />
            编辑文章
          </Button>
        </Link>
      </div>

      {/* 文章头部信息 */}
      <div className={styles.headerCard}>
        <div className={styles.headerContent}>
          {/* 左侧内容 */}
          <div className={styles.contentArea}>
            <h1 className={styles.title}>{post.title}</h1>
            
            {/* URL别名 */}
            <div className={styles.urlSection}>
              <Hash className={styles.urlIcon} />
              <span>/{post.slug}</span>
            </div>
            
            {/* 文章元信息 */}
            <div className={styles.metaInfo}>
              <time className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <span>创建于 {formatDateTime(post.createdAt)}</span>
              </time>
              
              <time className={styles.metaItem}>
                <Clock className={styles.metaIcon} />
                <span>更新于 {formatDateTime(post.updatedAt)}</span>
              </time>
              
              <div className={styles.metaItem}>
                <Badge variant={post.visible ? "default" : "secondary"} className={styles.statusBadge}>
                  {post.visible ? (
                    <>
                      <Globe className={styles.statusIcon} />
                      已发布
                    </>
                  ) : (
                    <>
                      <EyeOff className={styles.statusIcon} />
                      草稿
                    </>
                  )}
                </Badge>
              </div>
            </div>

            {/* 描述 */}
            <p className={styles.description}>{post.description}</p>

            {/* 标签 */}
            {post.tags && post.tags.length > 0 && (
              <div className={styles.tagsSection}>
                <TagIcon className={styles.tagsIcon} />
                <div className={styles.tagsList}>
                  {post.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className={styles.tagBadge}>
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 关键词 */}
            {post.keyWords && (
              <div className={styles.keywords}>
                <span className={styles.keywordsLabel}>关键词：</span>
                {post.keyWords}
              </div>
            )}

            {/* 关联代码库 */}
            {(post as any).relatedCodeRepository && (
              <div className={styles.tagsSection}>
                <Code2 className={styles.tagsIcon} />
                <Link 
                  href={`/admin/dashboard/resources/code/${(post as any).relatedCodeRepository.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                >
                  关联代码库：{(post as any).relatedCodeRepository.title}
                </Link>
              </div>
            )}
          </div>

          {/* 右侧封面图片 */}
          {post.image && (
            <div className={styles.imageArea}>
              <img
                src={post.image}
                alt={post.title}
                className={styles.coverImage}
              />
            </div>
          )}
        </div>
      </div>

      {/* 文章内容 */}
      <div className={styles.contentCard}>
        <R2UrlProvider signedUrls={signedUrls}>
          <div className={cn(
            styles.articleContent,
            "prose prose-gray dark:prose-invert",
            "prose-headings:scroll-mt-20",
            "prose-pre:bg-muted prose-pre:border",
            "prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
            "prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1"
          )}>
            <MdxRender 
              source={post.content}
              hydrate={{
                toc: true
              }}
            />
          </div>
        </R2UrlProvider>
      </div>
    </div>
  );
}