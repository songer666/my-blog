"use client";

import { Button } from "@/components/shadcn/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/shadcn/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { MessageType } from "@/server/types/message-type";
import styles from './delete-message-dialog.module.css';
import { useMessageAPI } from "@/client/message-api";
import { useRouter } from "next/navigation";

interface DeleteMessageDialogProps {
  message: MessageType;
}

/**
 * 删除消息按钮
 * @message 需要删除的消息
 */
export function DeleteMessageDialog({ message }: DeleteMessageDialogProps) {
  const router = useRouter();
  const { useDeleteMessage } = useMessageAPI();
  const deleteMutation = useDeleteMessage();

  const handleDelete = async () => {
    // toast 已在 message-api.tsx 中统一管理
    await deleteMutation.mutateAsync({ id: message.id });
    router.refresh();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild suppressHydrationWarning>
        <Button
          variant="ghost"
          size="sm"
          className={styles.deleteButton}
        >
          <Trash2 className={styles.deleteIcon} />
          <span className={styles.deleteText}>删除</span>
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className={styles.dialogContent}>
        <AlertDialogHeader className={styles.dialogHeader}>
          <AlertDialogTitle className={styles.dialogTitle}>
            确认删除消息
          </AlertDialogTitle>
          <AlertDialogDescription className={styles.dialogDescription}>
            您确定要删除来自 <strong className={styles.messageName}>{message.name}</strong> 的消息吗？
            <br />
            <span className={styles.messageEmail}>({message.email})</span>
            <br />
            <br />
            <span className={styles.warningText}>
              此操作无法撤销，消息将被永久删除。
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className={styles.dialogFooter}>
          <AlertDialogCancel className={styles.cancelButton}>
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            className={styles.confirmButton}
            onClick={handleDelete}
          >
            <Trash2 className={styles.confirmIcon} />
            确认删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
