"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Code2, HardDrive, Eye, Pencil, Trash2 } from "lucide-react";
import type { CodeRepositoryListItem } from "@/server/types/resources-type";
import { EditRepositoryDialog } from "../dialogs/edit-repository-dialog";
import { DeleteRepositoryDialog } from "../dialogs/delete-repository-dialog";

const styles = {
  card: `group hover:shadow-lg transition-shadow`.trim(),
  headerRow: `flex items-start justify-between`.trim(),
  headerContent: `flex-1`.trim(),
  title: `text-xl`.trim(),
  slug: `text-sm text-muted-foreground mt-1`.trim(),
  description: `text-sm text-muted-foreground line-clamp-2 mt-2`.trim(),
  keywordsContainer: `flex flex-wrap gap-1 mt-3`.trim(),
  keyword: `text-xs`.trim(),
  statsGrid: `grid grid-cols-2 gap-4`.trim(),
  statItem: `flex items-center gap-2 text-sm`.trim(),
  statIcon: `h-4 w-4 text-muted-foreground`.trim(),
  statText: `text-muted-foreground`.trim(),
  footer: `flex gap-2 pb-4`.trim(),
  viewButton: `flex-1`.trim(),
  iconButton: `h-4 w-4`.trim(),
  deleteIcon: `h-4 w-4 text-destructive`.trim(),
};

interface RepositoryCardProps {
  repository: CodeRepositoryListItem;
}

export function RepositoryCard({ repository }: RepositoryCardProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <>
      <Card className={styles.card}>
        <CardHeader>
          <div className={styles.headerRow}>
            <div className={styles.headerContent}>
              <CardTitle className={styles.title}>{repository.title}</CardTitle>
              <p className={styles.slug}>{repository.slug}</p>
            </div>
            {!repository.isPublic && (
              <Badge variant="secondary">私密</Badge>
            )}
          </div>
          {repository.description && (
            <p className={styles.description}>{repository.description}</p>
          )}

          {repository.keywords && repository.keywords.length > 0 && (
            <div className={styles.keywordsContainer}>
              {repository.keywords.slice(0, 5).map((keyword, index) => (
                <Badge key={index} variant="outline" className={styles.keyword}>
                  {keyword}
                </Badge>
              ))}
              {repository.keywords.length > 5 && (
                <Badge variant="outline" className={styles.keyword}>
                  +{repository.keywords.length - 5}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <Code2 className={styles.statIcon} />
              <span className={styles.statText}>
                {repository.itemCount} 个文件
              </span>
            </div>
            <div className={styles.statItem}>
              <HardDrive className={styles.statIcon} />
              <span className={styles.statText}>
                {formatSize(repository.totalSize)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className={styles.footer}>
          <Link href={`/admin/dashboard/resources/code/${repository.id}`} className={styles.viewButton}>
            <Button variant="default" className="w-full">
              <Eye className={styles.iconButton} />
              查看代码
            </Button>
          </Link>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowEditDialog(true)}
          >
            <Pencil className={styles.iconButton} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className={styles.deleteIcon} />
          </Button>
        </CardFooter>
      </Card>

      <EditRepositoryDialog
        repository={repository}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <DeleteRepositoryDialog
        repository={repository}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      />
    </>
  );
}
