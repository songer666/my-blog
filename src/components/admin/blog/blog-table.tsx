"use client";

import React, { useState, useMemo } from 'react';
import { PostWithTagsType } from '@/server/types/blog-type';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shadcn/ui/table';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { Input } from '@/components/shadcn/ui/input';
import { 
  Edit, 
  Eye, 
  Plus,
  Calendar,
  Tag as TagIcon,
  Search,
  Filter,
  X,
  Code2
} from 'lucide-react';
import Link from 'next/link';
import { BlogDeleteDialog } from './delete/blog-delete-dialog';
import { ToggleVisible } from './toggle/toggle-visible';
import { formatDateTime, cn } from '@/lib/utils';
import styles from './blog-table.module.css';
import { RevalidateButton } from '@/components/isr';

interface BlogTableProps {
  posts: PostWithTagsType[];
  onPostDeleted?: () => void;
}

export function BlogTable({ posts, onPostDeleted }: BlogTableProps) {
  // 筛选状态
  const [titleFilter, setTitleFilter] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // 获取所有唯一标签
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    posts.forEach(post => {
      post.tags?.forEach(tag => tagSet.add(tag.name));
    });
    return Array.from(tagSet).sort();
  }, [posts]);

  // 筛选后的文章
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // 标题筛选
      const titleMatch = titleFilter === '' || 
        post.title.toLowerCase().includes(titleFilter.toLowerCase()) ||
        post.description.toLowerCase().includes(titleFilter.toLowerCase()) ||
        post.slug.toLowerCase().includes(titleFilter.toLowerCase());
      
      // 标签筛选
      const tagMatch = selectedTag === '' || 
        post.tags?.some(tag => tag.name === selectedTag);
      
      return titleMatch && tagMatch;
    });
  }, [posts, titleFilter, selectedTag]);

  return (
    <>
      <div className={styles.container}>
        {/* 头部操作栏 */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title}>博客文章</h2>
            <p className={cn(styles.subtitle, "text-muted-foreground")}>
              管理您的博客文章，共 {posts.length} 篇文章
              {(titleFilter || selectedTag) && (
                <span className={styles.filterCount}>
                  (筛选后显示 {filteredPosts.length} 篇)
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <RevalidateButton type="blog" label="刷新博客页面" />
            <Link href="/admin/dashboard/blog/create">
              <Button className={styles.createButton}>
                <Plus className={styles.createIcon} />
                创建文章
              </Button>
            </Link>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className={styles.filterBar}>
          <div className={styles.searchContainer}>
            <div className={styles.searchWrapper}>
              <Search className={cn(styles.searchIcon, "text-muted-foreground")} />
              <Input
                placeholder="搜索标题、描述或URL别名..."
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                className={styles.searchInput}
              />
              {titleFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTitleFilter('')}
                  className={styles.clearSearchButton}
                >
                  <X className={styles.clearSearchIcon} />
                </Button>
              )}
            </div>
          </div>
          
          <div className={styles.tagSelect}>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={styles.tagSelectInput}
            >
              <option value="">所有标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          {(titleFilter || selectedTag) && (
            <Button
              variant="outline"
              onClick={() => {
                setTitleFilter('');
                setSelectedTag('');
              }}
              className={styles.clearFilterButton}
            >
              <Filter className={styles.clearFilterIcon} />
              清除筛选
            </Button>
          )}
        </div>

        {/* 表格 */}
        <div className={styles.tableContainer}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>封面</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>标签</TableHead>
                <TableHead>关联代码</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className={styles.tableHeader}>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className={styles.emptyState}>
                    <div className={cn(styles.emptyContent, "text-muted-foreground")}>
                      <TagIcon className={styles.emptyIcon} />
                      <p className={styles.emptyText}>
                        {posts.length === 0 ? '暂无文章数据' : '没有符合筛选条件的文章'}
                      </p>
                      <p className={styles.emptySubtext}>
                        {posts.length === 0 ? '点击上方创建文章按钮开始写作' : '尝试调整筛选条件'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className={styles.imageCell}>
                        {post.image ? (
                          <img
                            src={post.image}
                            alt={post.title}
                            className={styles.coverImage}
                          />
                        ) : (
                          <div className={styles.noImage}>
                            <span className="text-muted-foreground text-xs">无封面</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={styles.titleCell}>
                        <div className={styles.titleText}>{post.title}</div>
                        <div className={cn(styles.descriptionText, "text-muted-foreground line-clamp-2")}>
                          {post.description}
                        </div>
                        <div className={cn(styles.slugText, "text-muted-foreground")}>
                          /{post.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <ToggleVisible post={post} />
                    </TableCell>
                    <TableCell>
                      <div className={styles.tagsContainer}>
                        {post.tags && post.tags.length > 0 ? (
                          post.tags.map((tag) => (
                            <Badge key={tag.id} variant="outline" className={styles.tagBadge}>
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className={cn(styles.noTags, "text-muted-foreground")}>无标签</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(post as any).relatedCodeRepository ? (
                        <Link 
                          href={`/admin/dashboard/resources/code/${(post as any).relatedCodeRepository.id}`}
                          className="flex items-center gap-1 text-primary hover:underline text-sm"
                        >
                          <Code2 className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">
                            {(post as any).relatedCodeRepository.title}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={cn(styles.timeCell, "text-muted-foreground")}>
                        <Calendar className={styles.timeIcon} />
                        {formatDateTime(post.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(styles.timeText, "text-muted-foreground")}>
                        {formatDateTime(post.updatedAt)}
                      </div>
                    </TableCell>
                    <TableCell className={styles.actionsCell}>
                      <div className={styles.actionButtons}>
                        <RevalidateButton 
                          type="blog-detail" 
                          slug={post.slug}
                          size="icon"
                          variant="ghost"
                        />
                        <Link href={`/admin/dashboard/blog/${post.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className={styles.actionButton}
                          >
                            <Eye className={styles.actionIcon} />
                            查看
                          </Button>
                        </Link>
                        <Link href={`/admin/dashboard/blog/edit/${post.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className={styles.actionButton}
                          >
                            <Edit className={styles.actionIcon} />
                            编辑
                          </Button>
                        </Link>
                        <BlogDeleteDialog 
                          post={post}
                          onSuccess={onPostDeleted}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
