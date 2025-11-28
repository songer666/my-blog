import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Badge } from "@/components/shadcn/ui/badge";
import { Mail, MailOpen, Clock } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  isRead: boolean;
  createdAt: Date | string;
}

interface RecentMessagesProps {
  messages: Message[];
}

export function RecentMessages({ messages }: RecentMessagesProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} 分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours} 小时前`;
    } else if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else {
      return d.toLocaleDateString("zh-CN", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近消息</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无消息
            </p>
          ) : (
            messages.map((message) => (
              <Link
                key={message.id}
                href={`/admin/dashboard/message`}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {message.isRead ? (
                    <MailOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Mail className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.name}</span>
                    <Badge
                      variant={message.isRead ? "secondary" : "default"}
                      className="text-xs"
                    >
                      {message.isRead ? "已读" : "未读"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {message.email}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {message.content}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
