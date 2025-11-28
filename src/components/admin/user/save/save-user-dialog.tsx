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
import { UserPlus, Edit } from 'lucide-react';
import { SaveUserForm } from './save-form';
import styles from './save-user-dialog.module.css';
import { UserType } from '@/server/types/user-type';

interface SaveUserDialogProps {
  children?: React.ReactNode;
  onUserCreated?: () => void;
  mode?: 'create' | 'edit';
  user?: UserType;
}

export function SaveUserDialog({ children, onUserCreated, mode = 'create', user }: SaveUserDialogProps) {
  const [open, setOpen] = useState(false);
  
  const isEditMode = mode === 'edit';

  const handleSuccess = () => {
    // 关闭对话框
    setOpen(false);
    
    // 调用父组件的回调函数
    if (onUserCreated) {
      onUserCreated();
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className={styles.triggerButton}>
            {isEditMode ? (
              <>
                <Edit className={styles.triggerIcon} />
                编辑用户
              </>
            ) : (
              <>
                <UserPlus className={styles.triggerIcon} />
                添加用户
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>
            {isEditMode ? (
              <>
                <Edit className={styles.titleIcon} />
                编辑用户信息
              </>
            ) : (
              <>
                <UserPlus className={styles.titleIcon} />
                创建新用户
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className={styles.dialogBody}>
          <p className={styles.dialogDescription}>
            {isEditMode 
              ? '修改用户的基本信息（姓名和邮箱），密码无法通过此方式修改。'
              : '填写以下信息来创建新用户账户。用户创建后将收到邮件通知。'
            }
          </p>
          
          <SaveUserForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            mode={mode}
            user={user}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}