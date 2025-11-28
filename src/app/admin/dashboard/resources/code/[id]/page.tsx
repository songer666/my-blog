import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { notFound } from "next/navigation";
import { Badge } from "@/components/shadcn/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Code2, HardDrive, Download } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { CodeBrowser } from "@/components/admin/resources/code/browser/code-browser";
import { DemoImagesSection } from "@/components/admin/resources/code/demo-images-section";
import { UploadCodeDialog } from "@/components/admin/resources/code/dialogs/upload-code-dialog";
import { UploadZipDialog } from "@/components/admin/resources/code/dialogs/upload-zip-dialog";
import { DownloadZipButton } from "@/components/admin/resources/code/download-zip-button";
import styles from "./page.module.css";

interface RepositoryDetailPageProps {
  params: Promise<{ id: string }>;
}

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function RepositoryDetailPage({ params }: RepositoryDetailPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const repository = await queryClient.fetchQuery(trpc.codeRepository.byId.queryOptions({ id }));

  if (!repository) {
    notFound();
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={styles.container}>
      {/* 代码库信息 */}
      <div className={styles.repositoryHeader}>
        <div className={styles.repositoryInfo}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>{repository.title}</h1>
            {!repository.isPublic && (
              <Badge variant="secondary">私密</Badge>
            )}
          </div>
          <p className={styles.slug}>{repository.slug}</p>
          {repository.description && (
            <p className={styles.description}>
              {repository.description}
            </p>
          )}
        </div>
      </div>

      {/* 关键词和操作按钮 */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {repository.keywords && repository.keywords.length > 0 && (
          <div className={styles.keywordsContainer}>
            {repository.keywords.map((keyword, index) => (
              <Badge key={index} variant="outline">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <DownloadZipButton 
            repositoryId={repository.id}
            repositoryName={repository.slug || repository.title}
          />
        </div>
      </div>

      {/* 统计信息 */}
      <div className={styles.statsGrid}>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>代码文件数</CardTitle>
            <Code2 className={styles.icon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{repository.itemCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>总大小</CardTitle>
            <HardDrive className={styles.icon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{formatSize(repository.totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 代码文件区域 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">代码文件</h2>
          <div className="flex gap-2">
            <UploadZipDialog repositoryId={repository.id} />
            <UploadCodeDialog repositoryId={repository.id} />
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <CodeBrowser files={repository.items || []} />
          </CardContent>
        </Card>
      </div>

      {/* 演示图片区域 */}
      <DemoImagesSection 
        repositoryId={repository.id}
        images={repository.demoImages || []}
      />
    </div>
  );
}
