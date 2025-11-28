"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Badge } from '@/components/shadcn/ui/badge';
import { PostWithTagsType } from '@/server/types/blog-type';
import { MdxRender } from '@/components/mdx/render';
import { 
  X, 
  Calendar, 
  Tag as TagIcon, 
  Globe, 
  EyeOff,
  Clock,
  Hash
} from 'lucide-react';
import { formatDateTime, cn } from '@/lib/utils';
import styles from './content-dialog.module.css';

interface ContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostWithTagsType | null;
}

export function ContentDialog({ open, onOpenChange, post }: ContentDialogProps) {
  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.dialogContent}>
        {/* 头部 */}
        <DialogHeader className={cn(
          styles.header,
          "supports-[backdrop-filter]:bg-background/60"
        )}>
          <div className={styles.headerContent}>
            <div className={styles.headerInfo}>
              <DialogTitle className={styles.title}>
                {post.title}
              </DialogTitle>
              
              {/* 文章元信息 */}
              <div className={cn(styles.metaInfo, "text-muted-foreground")}>
                <div className={styles.metaItem}>
                  <Hash className={styles.metaIcon} />
                  <span>/{post.slug}</span>
                </div>
                
                <div className={styles.metaItem}>
                  <Calendar className={styles.metaIcon} />
                  <span>
                    创建于 {formatDateTime(post.createdAt)}
                  </span>
                </div>
                
                <div className={styles.metaItem}>
                  <Clock className={styles.metaIcon} />
                  <span>
                    更新于 {formatDateTime(post.updatedAt)}
                  </span>
                </div>
                
                <Badge 
                  variant={post.visible ? "default" : "secondary"}
                  className={styles.statusBadge}
                >
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

              {/* 描述 */}
              <p className={cn(styles.description, "text-muted-foreground")}>
                {post.description}
              </p>

              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className={styles.tagsContainer}>
                  <TagIcon className={cn(styles.tagsIcon, "text-muted-foreground")} />
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
                <div className={cn(styles.keywords, "text-muted-foreground")}>
                  <span className={styles.keywordsLabel}>关键词：</span>
                  {post.keyWords}
                </div>
              )}
            </div>

            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className={styles.closeButton}
            >
              <X className={styles.closeIcon} />
            </Button>
          </div>
        </DialogHeader>

        {/* 内容区域 */}
        <div className={styles.contentArea}>
          <div className={styles.contentWrapper}>
            {/* 封面图片 */}
            {post.image && (
              <div className={styles.coverImage}>
                <img
                  src={post.image}
                  alt={post.title}
                  className={styles.coverImg}
                />
              </div>
            )}

            {/* 文章内容 */}
            <div className={cn(
              styles.articleContent,
              "prose prose-gray dark:prose-invert"
            )}>
              <MdxRender 
                source={post.content}
                hydrate={{
                  toc: true
                }}
              />
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className={cn(
          styles.footer,
          "supports-[backdrop-filter]:bg-background/60"
        )}>
          <div className={styles.footerActions}>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={styles.footerButton}
            >
              关闭
            </Button>
            <Button
              onClick={() => {
                window.open(`/admin/dashboard/blog/edit/${post.id}`, '_blank');
              }}
              className={styles.footerButton}
            >
              编辑文章
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
