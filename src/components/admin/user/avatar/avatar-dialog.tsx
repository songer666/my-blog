"use client";

import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/ui/avatar';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { Upload, Camera } from 'lucide-react';
import { useAuthAPI } from '@/client/auth-api';
import { validateAvatarFile } from '@/client/profile/bio-api';
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { useUpdateAvatar } = useAuthAPI();
  const updateAvatarMutation = useUpdateAvatar();

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.message, { position: 'top-center' });
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 提交头像更新
  const handleSubmit = async () => {
    if (!avatarPreview) {
      toast.error('请先选择头像', { position: 'top-center' });
      return;
    }

    try {
      setIsSubmitting(true);

      await updateAvatarMutation.mutateAsync({
        id: user.id,
        image: avatarPreview,
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
    setAvatarPreview(user.image);
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
            {avatarPreview ? (
              <Avatar className={styles.previewAvatar}>
                <AvatarImage src={avatarPreview} alt="头像预览" />
                <AvatarFallback className={styles.previewFallback}>
                  <AvatarSkeleton className="w-24 h-24" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <AvatarSkeleton className="w-24 h-24" />
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileUpload}
              disabled={isSubmitting}
              className={styles.uploadButton}
            >
              <Upload className={styles.uploadButtonIcon} />
              选择头像
            </Button>
            
            <p className={styles.uploadTip}>
              支持 JPEG、PNG、WebP 格式，大小不超过 2MB
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarUpload}
              className={styles.fileInput}
            />
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
              disabled={isSubmitting || !avatarPreview}
              className={styles.submitButton}
            >
              {isSubmitting ? (
                <span className={styles.loadingContent}>
                  <Spinner className={styles.spinner} aria-hidden="true" />
                  <span>上传中...</span>
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
