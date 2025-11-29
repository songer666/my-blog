"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/ui/avatar';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { Upload, Camera } from 'lucide-react';
import { useAuthAPI } from '@/client/auth-api';
import { toast } from 'sonner';
import { UserType } from '@/server/types/user-type';
import { AvatarSkeleton } from '@/components/skeleton/admin-skeleton';
import styles from './avatar-dialog.module.css';

interface AvatarDialogProps {
  user: UserType;
  onAvatarUpdated?: () => void;
}

export function AvatarDialog({ user, onAvatarUpdated }: AvatarDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(user.image || '');
  const [error, setError] = useState<string>('');
  const { useUpdateAvatar } = useAuthAPI();
  const updateAvatarMutation = useUpdateAvatar();

  // 验证图片路径（支持URL和相对路径）
  const validateImageUrl = (url: string): boolean => {
    if (!url) {
      setError('请输入头像路径');
      return false;
    }
    
    // 如果是相对路径（以/开头），直接通过
    if (url.startsWith('/')) {
      setError('');
      return true;
    }
    
    // 如果是URL，验证格式
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setError('请输入有效的HTTP或HTTPS图片链接，或以/开头的相对路径');
        return false;
      }
      setError('');
      return true;
    } catch {
      setError('请输入有效的图片URL或相对路径（如 /images/avatar.jpg）');
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    setAvatarUrl(url);
    if (url.trim()) {
      validateImageUrl(url);
    } else {
      setError('');
    }
  };

  // 提交头像更新
  const handleSubmit = async () => {
    if (!validateImageUrl(avatarUrl)) {
      return;
    }

    try {
      setIsSubmitting(true);

      await updateAvatarMutation.mutateAsync({
        id: user.id,
        image: avatarUrl,
      });
      
      toast.success('头像更新成功', { 
        position: 'top-center',
        description: `用户 ${user.name} 的头像已成功更新`
      });
      
      // 关闭对话框
      setOpen(false);
      
      // 调用成功回调
      if (onAvatarUpdated) {
        onAvatarUpdated();
      }
    } catch (error: any) {
      console.error('头像更新错误:', error);
      
      toast.error('头像更新失败', {
        description: error?.message || '网络错误，请稍后重试',
        position: 'top-center',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setAvatarUrl(user.image || '');
    setError('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={styles.avatarTrigger}>
          <div className={styles.avatarContainer}>
            {user.image ? (
              <Avatar className={styles.avatar}>
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback className={styles.avatarFallback}>
                  <AvatarSkeleton className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <AvatarSkeleton className="w-10 h-10" />
            )}
            <div className={styles.uploadOverlay}>
              <Camera className={styles.uploadIcon} />
            </div>
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>
            <Upload className={styles.titleIcon} />
            更新头像
          </DialogTitle>
        </DialogHeader>
        
        <div className={styles.dialogBody}>
          <div className={styles.userInfo}>
            <div className={styles.userInfoLabel}>用户</div>
            <div className={styles.userInfoValue}>
              {user.name} ({user.email})
            </div>
          </div>
          
          <div className={styles.avatarUploadSection}>
            <div className="space-y-3 w-full">
              <label htmlFor="avatarUrl" className="text-sm font-medium">
                头像URL
              </label>
              <Input
                type="url"
                id="avatarUrl"
                value={avatarUrl}
                disabled={isSubmitting}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full"
              />
              
              {error && (
                <div className="text-sm text-red-500">
                  {error}
                </div>
              )}
              
              {avatarUrl && !error && (
                <div className="flex justify-center">
                  <Avatar className={styles.previewAvatar}>
                    <AvatarImage 
                      src={avatarUrl} 
                      alt="头像预览"
                      onError={() => setError('图片加载失败，请检查URL是否正确')}
                    />
                    <AvatarFallback className={styles.previewFallback}>
                      <AvatarSkeleton className="w-24 h-24" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <p className={styles.uploadTip}>
                支持完整URL（https://...）或相对路径（/images/avatar.jpg）
              </p>
            </div>
          </div>
          
          <div className={styles.buttonGroup}>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className={styles.cancelButton}
            >
              取消
            </Button>
            
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !avatarUrl}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <span className={styles.loadingContent}>
                  <Spinner className={styles.spinner} aria-hidden="true" />
                  <span>更新中...</span>
                </span>
              ) : (
                '更新头像'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
