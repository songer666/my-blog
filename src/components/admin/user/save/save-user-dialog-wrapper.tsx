"use client";

import { SaveUserDialog } from "./save-user-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserType } from "@/server/types/user-type";

interface SaveUserDialogWrapperProps {
  mode?: 'create' | 'edit';
  user?: UserType;
  children?: React.ReactNode;
}

export function SaveUserDialogWrapper({ mode = 'create', user, children }: SaveUserDialogWrapperProps) {
  const router = useRouter();

  const handleUserCreated = () => {
    // 用户创建/更新成功后的逻辑
    const message = mode === 'edit' ? '用户信息已更新' : '用户列表已更新';
    const description = mode === 'edit' 
      ? '用户信息更新成功，页面将自动刷新' 
      : '页面将自动刷新以显示新用户';
      
    toast.success(message, { 
      position: 'top-center',
      description
    });
    
    // 刷新页面数据
    router.refresh();
  };

  return (
    <SaveUserDialog 
      onUserCreated={handleUserCreated}
      mode={mode}
      user={user}
    >
      {children}
    </SaveUserDialog>
  );
}
