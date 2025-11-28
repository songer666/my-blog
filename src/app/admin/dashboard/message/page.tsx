import React from "react";
import { caller } from "@/components/trpc/server";
// 此页面使用 searchParams，保持 SSR，不需要 revalidatePath
import { MessageList } from "@/server/types/message-type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";
import { Mail, MessageSquarePlus } from "lucide-react";
import { DeleteMessageDialog } from "@/components/admin/message/delete/delete-message-dialog";
import { SaveMessageDialogWrapper } from "@/components/admin/message/save/save-message-dialog";
import { ToggleMessageRead } from "@/components/admin/message/toggle/toggle-message";
import styles from './page.module.css';

interface MessagePageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function MessagePage({ searchParams }: MessagePageProps) {
  const allMessages: MessageList = await caller.message.all();
  const params = await searchParams;
  const currentTab = params.tab || 'all';
  
  // 根据 tab 筛选消息
  const messages = currentTab === 'all' 
    ? allMessages
    : currentTab === 'unread'
    ? allMessages.filter(m => !m.isRead)
    : allMessages.filter(m => m.isRead);

  // 统计数据
  const totalMessages = allMessages.length;
  const unreadMessages = allMessages.filter(m => !m.isRead).length;
  const readMessages = allMessages.filter(m => m.isRead).length;

  return (
    <div className={styles.container}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>消息管理</h1>
          <p className={styles.subtitle}>
            管理用户留言和消息
          </p>
        </div>
        <SaveMessageDialogWrapper />
      </div>

      {/* 统计卡片 */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>总消息数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={styles.statValue}>{totalMessages}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>未读消息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${styles.statValue} ${styles.unread}`}>{unreadMessages}</p>
          </CardContent>
        </Card>
        
        <Card className={styles.statCard}>
          <CardHeader className={styles.statHeader}>
            <CardTitle className={styles.statTitle}>已读消息</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${styles.statValue} ${styles.read}`}>{readMessages}</p>
          </CardContent>
        </Card>
      </div>

      {/* 消息表格 - 使用 Tabs */}
      <Tabs id="message-tabs" value={currentTab} className={styles.tabsContainer}>
        <TabsList className={styles.tabsList} suppressHydrationWarning>
          <TabsTrigger value="all" asChild suppressHydrationWarning>
            <a href="?tab=all">全部 ({totalMessages})</a>
          </TabsTrigger>
          <TabsTrigger value="unread" asChild suppressHydrationWarning>
            <a href="?tab=unread">未读 ({unreadMessages})</a>
          </TabsTrigger>
          <TabsTrigger value="read" asChild suppressHydrationWarning>
            <a href="?tab=read">已读 ({readMessages})</a>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={currentTab} suppressHydrationWarning>
          <Card className={styles.tableCard}>
            <CardHeader className={styles.tableHeader}>
              <CardTitle className={styles.tableTitle}>消息列表</CardTitle>
            </CardHeader>
            <CardContent className={styles.tableContent}>
              <div className={styles.tableWrapper}>
                <Table>
                  <TableHeader>
                    <TableRow className={styles.headerRow}>
                      <TableHead className={styles.headerCell}>ID</TableHead>
                      <TableHead className={styles.headerCell}>姓名</TableHead>
                      <TableHead className={styles.headerCell}>邮箱</TableHead>
                      <TableHead className={styles.headerCell}>消息内容</TableHead>
                      <TableHead className={styles.headerCell}>IP地址</TableHead>
                      <TableHead className={styles.headerCell}>设备信息</TableHead>
                      <TableHead className={styles.headerCell}>状态</TableHead>
                      <TableHead className={styles.headerCell}>创建时间</TableHead>
                      <TableHead className={styles.actionsHeader}>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages && messages.length > 0 ? (
                      messages.map((message) => (
                        <TableRow key={message.id} className={styles.dataRow}>
                          <TableCell className={styles.dataCell}>
                            <span className={styles.messageId}>{message.id.slice(0, 8)}</span>
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <span className={styles.messageName}>{message.name}</span>
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <span className={styles.messageEmail}>{message.email}</span>
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <p className={styles.messageContent}>{message.content}</p>
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <span className={styles.ipText}>{message.ipAddress || '-'}</span>
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <div className={styles.uaText}>
                              {message.userAgent || '-'}
                            </div>
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <ToggleMessageRead message={message} />
                          </TableCell>
                          <TableCell className={styles.dataCell}>
                            <span className={styles.dateText}>
                              {message.createdAt ? new Date(message.createdAt).toLocaleDateString('zh-CN') : '-'}
                            </span>
                          </TableCell>
                          <TableCell className={styles.actionsCell}>
                            <div className={styles.actionButtons}>
                              <DeleteMessageDialog message={message} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className={styles.emptyCell}>
                          <div className={styles.emptyState}>
                            <Mail className={styles.emptyIcon} />
                            <p className={styles.emptyText}>暂无消息数据</p>
                            <p className={styles.emptySubtext}>还没有收到任何留言</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}