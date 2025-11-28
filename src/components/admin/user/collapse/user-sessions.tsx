"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shadcn/ui/accordion";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
  ItemDescription,
  ItemActions,
  ItemGroup,
} from "@/components/shadcn/ui/item";
import { Button } from "@/components/shadcn/ui/button";
import { Trash2, Monitor, Calendar, Globe } from "lucide-react";
import styles from './collapse.module.css';

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface UserSessionsProps {
  sessions: Session[];
  onDeleteSession?: (sessionToken: string) => void;
}

export function UserSessions({ sessions, onDeleteSession }: UserSessionsProps) {
  const handleDeleteSession = (sessionToken: string) => {
    if (onDeleteSession) {
      onDeleteSession(sessionToken);
    }
  };

  const formatUserAgent = (userAgent: string | null) => {
    // 简化用户代理字符串显示
    if (!userAgent) return '未知浏览器';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return '未知浏览器';
  };

  const formatExpiresAt = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Monitor className={styles.emptyIcon} />
        <p className={styles.emptyText}>暂无活跃会话</p>
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className={styles.accordion}>
      <AccordionItem value="sessions" className={styles.accordionItem}>
        <AccordionTrigger className={styles.accordionTrigger}>
          <div className={styles.triggerContent}>
            <Monitor className={styles.triggerIcon} />
            <span className={styles.triggerText}>
              活跃会话 ({sessions.length})
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className={styles.accordionContent}>
          <ItemGroup className={styles.sessionsList}>
            {sessions.map((session, index) => (
              <Item key={session.id} variant="outline" className={styles.sessionItem}>
                <ItemMedia variant="icon" className={styles.sessionMedia}>
                  <Monitor />
                </ItemMedia>
                
                <ItemContent className={styles.sessionContent}>
                  <ItemTitle className={styles.sessionTitle}>
                    会话 #{index + 1}
                    <span className={styles.sessionToken}>
                      {session.token.substring(0, 8)}...
                    </span>
                  </ItemTitle>
                  
                  <div className={styles.sessionDescription}>
                    <div className={styles.sessionDetails}>
                      <span className={styles.detailItem}>
                        <Globe className={styles.detailIcon} />
                        IP: {session.ipAddress || '未知'}
                      </span>
                      <span className={styles.detailItem}>
                        <Monitor className={styles.detailIcon} />
                        {session.userAgent ? formatUserAgent(session.userAgent) : '未知浏览器'}
                      </span>
                      <span className={styles.detailItem}>
                        <Calendar className={styles.detailIcon} />
                        过期: {formatExpiresAt(session.expiresAt)}
                      </span>
                    </div>
                  </div>
                </ItemContent>
                
                <ItemActions className={styles.sessionActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={styles.deleteButton}
                    onClick={() => handleDeleteSession(session.token)}
                  >
                    <Trash2 className={styles.deleteIcon} />
                    <span className={styles.deleteText}>删除</span>
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </ItemGroup>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
