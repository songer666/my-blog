"use client";

import { AvatarDialog } from "./avatar-dialog";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserType } from "@/server/types/user-type";

interface AvatarDialogWrapperProps {
  user: UserType;
}

export function AvatarDialogWrapper({ user }: AvatarDialogWrapperProps) {
  const router = useRouter();

  const handleAvatarUpdated = () => {
    // 头像更新成功后的逻辑
    toast.success('头像更新成功', { 
      position: 'top-center',
      description: '用户头像已更新，页面将自动刷新'
    });
    
    // 刷新页面数据
    router.refresh();
  };

  return (
    <AvatarDialog 
      user={user}
      onAvatarUpdated={handleAvatarUpdated}
    />
  );
}
