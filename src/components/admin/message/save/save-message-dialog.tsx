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
import { MessageSquarePlus } from 'lucide-react';
import { SaveMessageForm } from './save-message-form';
import styles from './save-message-dialog.module.css';
import {useRouter} from "next/navigation";

interface SaveMessageDialogProps {
  children?: React.ReactNode;
  onMessageCreated?: () => void;
}

export function SaveMessageDialog({ children, onMessageCreated }: SaveMessageDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    // 关闭对话框
    setOpen(false);
    
    // 调用父组件的回调函数
    if (onMessageCreated) {
      onMessageCreated();
    }
    router.refresh();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild suppressHydrationWarning>
        {children || (
          <Button className={styles.triggerButton}>
            <MessageSquarePlus className={styles.triggerIcon} />
            添加消息
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className={styles.dialogContent}>
        <DialogHeader className={styles.dialogHeader}>
          <DialogTitle className={styles.dialogTitle}>
            <MessageSquarePlus className={styles.titleIcon} />
            创建新消息
          </DialogTitle>
        </DialogHeader>
        
        <div className={styles.dialogBody}>
          <p className={styles.dialogDescription}>
            填写以下信息来创建新的留言消息。
          </p>
          
          <SaveMessageForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 服务端组件包装器
 */
export function SaveMessageDialogWrapper() {
  return <SaveMessageDialog />;
}
