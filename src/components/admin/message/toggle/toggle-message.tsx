"use client";

import { Switch } from "@/components/shadcn/ui/switch";
import { MessageType } from "@/server/types/message-type";
import { useMessageAPI } from "@/client/message-api";
import styles from './toggle-message.module.css';
import { useRouter } from "next/navigation";

interface ToggleMessageReadProps {
  message: MessageType;
}

/**
 * 切换消息已读状态组件
 * @param message 消息对象
 */
export function ToggleMessageRead({ message }: ToggleMessageReadProps) {
  const router = useRouter();
  const { useToggleRead } = useMessageAPI();
  const toggleMutation = useToggleRead();

  const handleToggle = async (checked: boolean) => {
    // toast 已在 message-api.tsx 中统一管理
    await toggleMutation.mutateAsync({ id: message.id, isRead: checked });
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.switchWrapper}>
        <Switch
          checked={message.isRead}
          onCheckedChange={handleToggle}
          disabled={toggleMutation.isPending}
          className={styles.switch}
        />
        <div className={styles.statusInfo}>
          <span className={`${styles.statusText} ${
            message.isRead ? styles.read : styles.unread
          }`}>
            {message.isRead ? '已读' : '未读'}
          </span>
        </div>
      </div>
      
      {toggleMutation.isPending && (
        <div className={styles.loadingIndicator}>
          <span className={styles.loadingText}>更新中...</span>
        </div>
      )}
    </div>
  );
}
