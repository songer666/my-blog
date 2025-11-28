import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { TagList } from "@/server/types/blog-type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import { TagDialogWrapper } from "@/components/admin/blog/tag/tag-dialog-wrapper";
import styles from './page.module.css';

// Admin 页面需要认证，保持动态渲染

export default async function BlogTagPage() {
  const queryClient = getQueryClient();
  const tagsResult = await queryClient.fetchQuery(trpc.tag.getAll.queryOptions());
  const tags: TagList = tagsResult.data || [];

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>标签管理</h1>
          <p className={styles.subtitle}>
            管理博客文章标签，用于分类和组织内容
          </p>
        </div>
        <TagDialogWrapper mode="create">
          <Button className={styles.addButton}>
            <Plus className={styles.buttonIcon} />
            添加标签
          </Button>
        </TagDialogWrapper>
      </div>

      {/* 标签表格 */}
      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <CardTitle className={styles.tableTitle}>标签列表</CardTitle>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow className={styles.headerRow}>
                  <TableHead className={styles.headerCell}>ID</TableHead>
                  <TableHead className={styles.headerCell}>标签名称</TableHead>
                  <TableHead className={styles.headerCell}>创建时间</TableHead>
                  <TableHead className={styles.headerCell}>更新时间</TableHead>
                  <TableHead className={styles.actionsHeader}>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <TableRow key={tag.id} className={styles.dataRow}>
                      <TableCell className={styles.dataCell}>
                        <span className={styles.tagId}>{tag.id}</span>
                      </TableCell>
                      <TableCell className={styles.dataCell}>
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <span className={styles.tagName}>{tag.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className={styles.dataCell}>
                        <span className={styles.dateText}>
                          {tag.createdAt ? new Date(tag.createdAt).toLocaleDateString('zh-CN') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className={styles.dataCell}>
                        <span className={styles.dateText}>
                          {tag.updatedAt ? new Date(tag.updatedAt).toLocaleDateString('zh-CN') : '-'}
                        </span>
                      </TableCell>
                      <TableCell className={styles.actionsCell}>
                        <div className={styles.actionButtons}>
                          <TagDialogWrapper mode="edit" tag={tag}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              编辑
                            </Button>
                          </TagDialogWrapper>
                          <TagDialogWrapper mode="delete" tag={tag}>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 mr-1" />
                              删除
                            </Button>
                          </TagDialogWrapper>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className={styles.emptyCell}>
                      <div className={styles.emptyState}>
                        <Tag className={styles.emptyIcon} />
                        <p className={styles.emptyText}>暂无标签数据</p>
                        <p className={styles.emptySubtext}>点击上方添加标签按钮创建第一个标签</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}