"use client";

import React, { useEffect } from 'react';
import { ProjectType } from '@/server/types/project-type';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';
import { Calendar, Globe, EyeOff, Github, ExternalLink, Edit } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useBreadCrumbStore } from '@/store/breadcrumb/store';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MdxHydrate } from '@/components/mdx/hydrate';
import type { MdxHydrateProps } from '@/components/mdx/type';
import { R2UrlProvider } from '@/components/mdx/context/r2-url-context';
import styles from './project-content.module.css';

interface ProjectContentProps {
  project: ProjectType;
  serializedContent: MdxHydrateProps['serialized'];
  signedUrls?: Record<string, string>;
}

export function ProjectContent({ project, serializedContent, signedUrls = {} }: ProjectContentProps) {
  const pathname = usePathname();
  const { setCrumbs } = useBreadCrumbStore(state => ({
    setCrumbs: state.setCrumbs
  }));

  // 更新面包屑显示项目标题
  useEffect(() => {
    if (pathname.startsWith('/admin/dashboard/projects/') && project) {
      setCrumbs([
        { title: "项目栏" },
        { title: "项目详情" },
        { title: project.title }
      ]);
    }
  }, [pathname, project, setCrumbs]);

  return (
    <div className={styles.container}>
      {/* 头部信息 */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{project.title}</h1>
            <Badge 
              variant={project.visible ? "default" : "secondary"}
              className={styles.statusBadge}
            >
              {project.visible ? (
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
          
          <p className={styles.description}>{project.description}</p>
          
          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              <span>创建于 {formatDateTime(project.createdAt)}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              <span>更新于 {formatDateTime(project.updatedAt)}</span>
            </div>
          </div>
          
          {/* 链接区域 */}
          {(project.githubUrl || project.demoUrl) && (
            <div className={styles.links}>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <Github className={styles.linkIcon} />
                  <span>查看源码</span>
                  <ExternalLink className={styles.externalIcon} />
                </a>
              )}
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <Globe className={styles.linkIcon} />
                  <span>在线演示</span>
                  <ExternalLink className={styles.externalIcon} />
                </a>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.actions}>
          <Link href={`/admin/dashboard/project/edit/${project.id}`}>
            <Button variant="outline" size="sm" className={styles.editButton}>
              <Edit className={styles.actionIcon} />
              编辑项目
            </Button>
          </Link>
        </div>
      </div>
      
      {/* 封面图片 */}
      {project.image && (
        <div className={styles.imageWrapper}>
          <img
            src={project.image}
            alt={project.title}
            className={styles.coverImage}
          />
        </div>
      )}
      
      {/* MDX 内容 */}
      <div className={styles.contentWrapper}>
        <R2UrlProvider signedUrls={signedUrls}>
          <div className={styles.mdxContent}>
            <MdxHydrate serialized={serializedContent} toc={false} />
          </div>
        </R2UrlProvider>
      </div>
    </div>
  );
}

