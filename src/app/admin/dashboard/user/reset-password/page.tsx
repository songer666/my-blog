import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { KeyRound } from 'lucide-react';
import { ResetPasswordForm } from '@/components/admin/user/password/reset-password-form';
import styles from './page.module.css';

export default async function ResetPasswordPage() {
  // 从 cookie 中获取 token
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  // 如果没有 token，重定向到用户列表页面
  if (!token) {
    redirect('/admin/dashboard/user');
  }

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardHeader className={styles.cardHeader}>
          <CardTitle className={styles.cardTitle}>
            <KeyRound className={styles.titleIcon} />
            重置密码
          </CardTitle>
          <p className={styles.cardDescription}>
            请输入您的新密码
          </p>
        </CardHeader>
        <CardContent className={styles.cardContent}>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
}
