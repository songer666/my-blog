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
import { UserType } from "@/server/types/user-type";
import styles from './delete-user.module.css';
import { useAuthAPI } from "@/client/auth-api";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

interface DeleteUserFormProps {
  user: UserType;
  ownerEmail: string;
  superEmail: string;
}

/**
 * 删除用户按钮
 * @user 需要删除的用户
 * @disableDelete 是否不能被删除的用户(超级管理员和当前用户)
 * */
export function DeleteUserForm({ user, ownerEmail, superEmail }: DeleteUserFormProps) {
    const isAdmin:boolean = user.email === superEmail;
    const isOwner:boolean = user.email === ownerEmail;
    const disableDelete = isAdmin || isOwner;
    const router = useRouter();

    const { useDeleteUser } = useAuthAPI();
    const deleteMutation = useDeleteUser();

    const handleDelete = async () => {
        if (!disableDelete) {
            const res = await deleteMutation.mutateAsync({id: user.id});
            if (res && res.deleted) {
                toast.success('用户删除成功', {
                    position: 'top-center',
                });
                router.refresh();
            }else {
                toast.error('用户删除失败', {
                    position: 'top-center',
                });
            }
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={styles.deleteButton}
                    disabled={disableDelete}
                >
                    <Trash2 className={styles.deleteIcon} />
                    <span className={styles.deleteText}>删除</span>
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className={styles.dialogContent}>
                <AlertDialogHeader className={styles.dialogHeader}>
                    <AlertDialogTitle className={styles.dialogTitle}>
                        确认删除用户
                    </AlertDialogTitle>
                    <AlertDialogDescription className={styles.dialogDescription}>
                        您确定要删除用户 <strong className={styles.userName}>{user.name}</strong> 吗？
                        <br />
                        <span className={styles.userEmail}>({user.email})</span>
                        <br />
                        <br />
                        <span className={styles.warningText}>
              此操作无法撤销，用户的所有数据将被永久删除。
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
                        disabled={disableDelete}
                    >
                        <Trash2 className={styles.confirmIcon} />
                        确认删除
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}