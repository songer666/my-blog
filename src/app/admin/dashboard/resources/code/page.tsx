import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Code2, HardDrive, FolderGit2 } from "lucide-react";
import { CreateRepositoryDialog } from "@/components/admin/resources/code/dialogs/create-repository-dialog";
import { RepositoryList } from "@/components/admin/resources/code/repository-list";
import styles from "./page.module.css";

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function CodeRepositoriesPage() {
  const queryClient = getQueryClient();
  const repositories = await queryClient.fetchQuery(trpc.codeRepository.all.queryOptions());

  // 统计
  const totalRepositories = repositories.length;
  const totalFiles = repositories.reduce((sum, repo) => sum + repo.itemCount, 0);
  const totalSize = repositories.reduce((sum, repo) => sum + repo.totalSize, 0);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={styles.container}>
      {/* 标题和操作 */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.headerTitle}>代码库管理</h1>
          <p className={styles.headerDescription}>
            管理您的代码文件和项目
          </p>
        </div>
        <CreateRepositoryDialog />
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>代码库数量</CardTitle>
            <FolderGit2 className={styles.icon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{totalRepositories}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>总文件数</CardTitle>
            <Code2 className={styles.icon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{totalFiles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>总大小</CardTitle>
            <HardDrive className={styles.icon} />
          </CardHeader>
          <CardContent>
            <div className={styles.statValue}>{formatSize(totalSize)}</div>
          </CardContent>
        </Card>
      </div>

      {/* 代码库列表 */}
      <RepositoryList repositories={repositories} />
    </div>
  );
}
