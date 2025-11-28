"use client";

import React, { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { KeyRound } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { UserType } from '@/server/types/user-type';
import styles from './reset-password-button.module.css';

interface ResetPasswordButtonProps {
  user: UserType;
}

export function ResetPasswordButton({ user }: ResetPasswordButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      
      const { data } = await authClient.forgetPassword({
        email: user.email,
      });
      
      if (data?.status === true) {
        toast.success('重置链接已生成', {
          position: 'top-center',
          description: '正在跳转到密码重置页面...'
        });
        
        // 跳转到重置密码页面
        router.push('/admin/dashboard/user/reset-password');
      } else {
        throw new Error('重置请求失败');
      }
    } catch (error: any) {
      console.error('密码重置错误:', error);
      
      toast.error('密码重置失败', {
        description: error?.message || '网络错误，请稍后重试',
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleResetPassword}
      disabled={isLoading}
      className={`${styles.resetButton} ${isLoading ? styles.loadingButton : ''}`}
    >
      <KeyRound className={styles.buttonIcon} />
      <span className={styles.buttonText}>
        {isLoading ? '重置中...' : '改密码'}
      </span>
    </Button>
  );
}
