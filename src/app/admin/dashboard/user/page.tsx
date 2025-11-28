import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import {UserList} from "@/server/types/user-type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { UserPlus, Edit } from "lucide-react";
import { UsersCard } from "@/components/admin/user/card/users-card";
import { DeleteUserForm } from "@/components/admin/user/delete/delete-user";
import { UserSessionsWrapper } from "@/components/admin/user/collapse/user-sessions-wrapper";
import { SaveUserDialogWrapper } from "@/components/admin/user/save/save-user-dialog-wrapper";
import { ResetPasswordButton } from "@/components/admin/user/password/reset-password-button";
import { AvatarDialogWrapper } from "@/components/admin/user/avatar/avatar-dialog-wrapper";
import { Button } from "@/components/shadcn/ui/button";
import { ToggleVerify } from "@/components/admin/user/toggle/toggle-verify";
import styles from './page.module.css';
import {auth} from "@/lib/auth";
import {headers} from "next/headers";

// Admin 页面需要认证，保持动态渲染

export default async function UserPage() {
  const queryClient = getQueryClient();
  const users: UserList = await queryClient.fetchQuery(trpc.auth.all.queryOptions());
  const res = await auth.api.getSession({headers: await headers()});
  const currentUser = res?.user;
  const superUser = process.env.SUPER_ADMIN as string;

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>用户管理</h1>
          <p className={styles.subtitle}>
            管理系统用户账户和权限设置
          </p>
        </div>
        <SaveUserDialogWrapper />
      </div>

      {/* 用户统计卡片 */}
      <UsersCard users={users} />

      {/* 用户表格 */}
      <Card className={styles.tableCard}>
        <CardHeader className={styles.tableHeader}>
          <CardTitle className={styles.tableTitle}>用户列表</CardTitle>
        </CardHeader>
        <CardContent className={styles.tableContent}>
          <div className={styles.tableWrapper}>
            <Table>
              <TableHeader>
                <TableRow className={styles.headerRow}>
                  <TableHead className={styles.headerCell}>ID</TableHead>
                  <TableHead className={styles.headerCell}>头像</TableHead>
                  <TableHead className={styles.headerCell}>用户名</TableHead>
                  <TableHead className={styles.headerCell}>邮箱</TableHead>
                  <TableHead className={styles.headerCell}>验证状态</TableHead>
                  <TableHead className={styles.headerCell}>创建时间</TableHead>
                  <TableHead className={styles.headerCell}>更新时间</TableHead>
                  <TableHead className={styles.actionsHeader}>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <React.Fragment key={user.id}>
                      <TableRow className={styles.dataRow}>
                        <TableCell className={styles.dataCell}>
                          <span className={styles.userId}>{user.id}</span>
                        </TableCell>
                        <TableCell className={styles.dataCell}>
                          <AvatarDialogWrapper user={user} />
                        </TableCell>
                        <TableCell className={styles.dataCell}>
                          <div className={styles.userInfo}>
                            <span className={styles.userName}>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className={styles.dataCell}>
                          <span className={styles.userEmail}>{user.email}</span>
                        </TableCell>
                        <TableCell className={styles.dataCell}>
                          <ToggleVerify 
                            user={user}
                            ownerEmail={currentUser?.email as string}
                            superEmail={superUser}
                          />
                        </TableCell>
                        <TableCell className={styles.dataCell}>
                          <span className={styles.dateText}>
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}
                          </span>
                        </TableCell>
                        <TableCell className={styles.dataCell}>
                          <span className={styles.dateText}>
                            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('zh-CN') : '-'}
                          </span>
                        </TableCell>
                        <TableCell className={styles.actionsCell}>
                          <div className={styles.actionButtons}>
                            <SaveUserDialogWrapper mode="edit" user={user}>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                编辑
                              </Button>
                            </SaveUserDialogWrapper>
                            {/* 超级管理员可以修改所有用户密码，其他人只能修改自己的密码 */}
                            {(currentUser?.email === superUser || currentUser?.email === user.email) && (
                              <ResetPasswordButton user={user} />
                            )}
                            <DeleteUserForm user={user} ownerEmail={currentUser?.email as string} superEmail={superUser} />
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* 会话折叠面板行 */}
                      <TableRow className={styles.sessionRow}>
                        <TableCell colSpan={8} className={styles.sessionCell}>
                          <UserSessionsWrapper sessions={user.sessions || []} />
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className={styles.emptyCell}>
                      <div className={styles.emptyState}>
                        <UserPlus className={styles.emptyIcon} />
                        <p className={styles.emptyText}>暂无用户数据</p>
                        <p className={styles.emptySubtext}>点击上方添加用户按钮创建第一个用户</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}