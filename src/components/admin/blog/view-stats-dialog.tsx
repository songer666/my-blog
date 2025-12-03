"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shadcn/ui/table";
import { BarChart3, Eye } from "lucide-react";
import { useTRPC } from "@/components/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatDateTime } from "@/lib/utils";

interface ViewStatsDialogProps {
  postId: string;
  postTitle: string;
}

const styles = {
  trigger: 'gap-1',
  triggerIcon: 'h-4 w-4',
  content: 'max-w-6xl max-h-[80vh] overflow-hidden flex flex-col',
  title: 'flex items-center gap-2',
  titleIcon: 'h-5 w-5',
  description: 'truncate',
  body: 'flex-1 overflow-auto',
  summary: {
    container: 'flex items-center gap-2 p-4 bg-muted/50 rounded-lg mb-4',
    icon: 'h-5 w-5 text-primary',
    label: 'text-sm text-muted-foreground',
    count: 'text-2xl font-bold text-primary',
  },
  table: {
    container: 'border rounded-lg overflow-hidden',
    scroll: 'max-h-[400px] overflow-y-auto',
    header: 'bg-muted/50',
    cell: {
      ip: 'font-mono text-xs',
      ua: 'max-w-[300px] text-xs text-muted-foreground truncate',
      time: 'text-xs text-muted-foreground whitespace-nowrap',
    },
  },
  empty: 'text-center py-8 text-muted-foreground',
  loading: 'text-center py-8 text-muted-foreground',
};

export function ViewStatsDialog({ postId, postTitle }: ViewStatsDialogProps) {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();

  // 获取统计数据（管理端专用，不检查配置）
  const { data: statsData, isLoading: statsLoading } = useQuery({
    ...trpc.postStats.adminGetStats.queryOptions({ postId }),
    enabled: open,
  });

  // 获取访问记录列表
  const { data: viewListData, isLoading: viewListLoading } = useQuery({
    ...trpc.postStats.getViewList.queryOptions({ postId }),
    enabled: open,
  });

  const viewCount = statsData?.data?.viewCount ?? 0;
  const viewList = viewListData?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={styles.trigger}>
          <BarChart3 className={styles.triggerIcon} />
          统计
        </Button>
      </DialogTrigger>
      <DialogContent className={styles.content}>
        <DialogHeader>
          <DialogTitle className={styles.title}>
            <BarChart3 className={styles.titleIcon} />
            访问统计
          </DialogTitle>
          <DialogDescription className={styles.description}>
            {postTitle}
          </DialogDescription>
        </DialogHeader>

        <div className={styles.body}>
          {/* 总计 */}
          <div className={styles.summary.container}>
            <Eye className={styles.summary.icon} />
            <span className={styles.summary.label}>总访问量：</span>
            <span className={styles.summary.count}>
              {statsLoading ? "..." : viewCount}
            </span>
          </div>

          {/* 访问记录表格 */}
          {viewListLoading ? (
            <div className={styles.loading}>加载中...</div>
          ) : viewList.length === 0 ? (
            <div className={styles.empty}>暂无访问记录</div>
          ) : (
            <div className={styles.table.container}>
              <div className={styles.table.scroll}>
                <Table>
                  <TableHeader className={styles.table.header}>
                    <TableRow>
                      <TableHead className="w-[120px]">IP 地址</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead className="w-[160px] text-right">访问时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viewList.map((view) => (
                      <TableRow key={view.id}>
                        <TableCell className={styles.table.cell.ip}>
                          {view.ip}
                        </TableCell>
                        <TableCell className={styles.table.cell.ua} title={view.userAgent || '-'}>
                          {view.userAgent || '-'}
                        </TableCell>
                        <TableCell className={styles.table.cell.time}>
                          {formatDateTime(view.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
