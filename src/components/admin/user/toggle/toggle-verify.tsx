"use client";

import { Switch } from "@/components/shadcn/ui/switch";
import { UserType } from "@/server/types/user-type";
import { useAuthAPI } from "@/client/auth-api";
import { toast } from "sonner";
import styles from './toggle-verify.module.css';
import {useRouter} from "next/navigation";

interface ToggleVerifyProps {
  user: UserType;
  ownerEmail: string;
  superEmail: string;
}

/**
 * 切换用户验证状态组件
 * @param user 用户对象
 * @param ownerEmail 当前登录用户邮箱
 * @param superEmail 超级管理员邮箱
 */
export function ToggleVerify({ user, ownerEmail, superEmail }: ToggleVerifyProps) {
  const isAdmin: boolean = user.email === superEmail;
  const isOwner: boolean = user.email === ownerEmail;
  const disableToggle = isAdmin || isOwner;
  const router = useRouter();
  const { useToggleVerify } = useAuthAPI();
  const toggleMutation = useToggleVerify();

  const handleToggle = async (checked: boolean) => {
    if (disableToggle) {
      toast.warning('无法修改此用户的验证状态', {
        position: 'top-center',
        description: isAdmin ? '超级管理员账户不能修改' : '不能修改自己的验证状态'
      });
      return;
    }

    try {
      const res = await toggleMutation.mutateAsync({
        id: user.id,
        emailVerified: checked
      });

      if (res) {
        toast.success('验证状态更新成功', {
          position: 'top-center',
          description: `用户 ${user.name} 已${checked ? '启用' : '禁用'}登录`
        });
      } else {
        toast.error('验证状态更新失败', {
          position: 'top-center',
          description: '服务器返回了错误状态'
        });
      }
    } catch (error: any) {
      console.error('切换验证状态错误:', error);
      
      toast.error('验证状态更新失败', {
        position: 'top-center',
        description: error?.message || '网络错误，请稍后重试'
      });
    } finally {
        router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.switchWrapper}>
        <Switch
          checked={user.emailVerified}
          onCheckedChange={handleToggle}
          disabled={disableToggle || toggleMutation.isPending}
          className={styles.switch}
        />
        <div className={styles.statusInfo}>
          <span className={`${styles.statusText} ${
            user.emailVerified ? styles.verified : styles.unverified
          }`}>
            {user.emailVerified ? '已验证' : '待验证'}
          </span>
          {disableToggle && (
            <span className={styles.disabledHint}>
              {isAdmin ? '管理员' : '当前用户'}
            </span>
          )}
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