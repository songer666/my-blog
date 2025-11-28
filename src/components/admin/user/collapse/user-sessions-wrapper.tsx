"use client";

import { useState } from "react";
import { UserSessions } from "./user-sessions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/shadcn/ui/alert-dialog";
import { Spinner } from "@/components/shadcn/ui/spinner";
import { authApi } from "@/client/auth-api";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {useRouter} from "next/navigation";

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface UserSessionsWrapperProps {
  sessions: Session[];
}

export function UserSessionsWrapper({ sessions }: UserSessionsWrapperProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

  const handleDeleteClick = (sessionToken: string) => {
    setSessionToDelete(sessionToken);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    try {
      setIsDeleting(true);
      
      const { data } = await authApi.revokeSession(sessionToDelete);
      
      if (data?.status === true) {
        toast.success("删除会话成功", { 
          position: 'top-center',
          description: "会话已被成功撤销"
        });
        
        // 关闭对话框并重置状态
        setDeleteDialogOpen(false);
        setSessionToDelete(null);
        
        // 可以在这里添加刷新页面或更新状态的逻辑
        // 例如: router.refresh() 或调用重新获取数据的函数
        
      } else {
        toast.error("删除会话失败", { 
          position: 'top-center',
          description: "服务器返回了错误状态"
        });
      }
    } catch (error: any) {
      console.error('删除会话错误:', error);
      
      toast.error("删除会话失败", {
        description: error?.message || "网络错误，请稍后重试",
        position: "top-center",
      });
    } finally {
      setIsDeleting(false);
      router.refresh();
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  return (
    <>
      <UserSessions 
        sessions={sessions} 
        onDeleteSession={handleDeleteClick}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              确认删除会话
            </AlertDialogTitle>
            <AlertDialogDescription>
              您确定要删除这个会话吗？
              <br />
              <br />
              <span className="text-muted-foreground text-xs">
                Token: <code className="bg-muted px-1 py-0.5 rounded text-xs">
                  {sessionToDelete?.substring(0, 16)}...
                </code>
              </span>
              <br />
              <br />
              <span className="text-destructive/80 font-medium">
                此操作将立即终止该会话，用户需要重新登录。
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="w-4 h-4" />
                  <span>删除中...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  <span>确认删除</span>
                </div>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
