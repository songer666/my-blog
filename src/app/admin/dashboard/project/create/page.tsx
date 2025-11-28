import React from 'react';
import { ProjectSaveWrapper } from '@/components/admin/project/save/project-save-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import styles from './page.module.css';

export default async function ProjectCreatePage() {
  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>创建新项目</h1>
          <p className={styles.subtitle}>
            编写并发布您的项目展示
          </p>
        </div>
      </div>

      {/* 编辑表单 */}
      <Card className={styles.formCard}>
        <CardHeader className={styles.formHeader}>
          <div className={styles.cardHeaderContent}>
            <CardTitle className={styles.formTitle}>
              <Plus className={styles.formIcon} />
              项目信息
            </CardTitle>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="cursor-pointer">
                取消
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className={styles.formContent}>
          <ProjectSaveWrapper mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
