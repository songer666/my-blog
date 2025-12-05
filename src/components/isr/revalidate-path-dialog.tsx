"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { revalidatePathAction } from "@/server/actions/revalidate-action";

// 常用路径快捷选项
const QUICK_PATHS = [
  { label: "主页", path: "/" },
  { label: "博客列表", path: "/blog" },
  { label: "项目列表", path: "/projects" },
  { label: "关于", path: "/about" },
  { label: "图片资源", path: "/resources/image" },
  { label: "音乐资源", path: "/resources/music" },
  { label: "视频资源", path: "/resources/video" },
  { label: "代码资源", path: "/resources/code" },
];

interface RevalidatePathDialogProps {
  label?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RevalidatePathDialog({
  label = "重置页面",
  variant = "outline",
  size = "sm",
  className,
}: RevalidatePathDialogProps) {
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRevalidate = async () => {
    if (!path.trim()) {
      toast.error("请输入要重置的路径");
      return;
    }

    // 确保路径以 / 开头
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;

    setLoading(true);
    try {
      const result = await revalidatePathAction(normalizedPath);

      if (result.success) {
        toast.success("页面缓存重置成功", {
          description: `路径: ${normalizedPath}`,
        });
        setPath("");
        setOpen(false);
      } else {
        toast.error("页面缓存重置失败", {
          description: result.error || "未知错误",
        });
      }
    } catch (error) {
      console.error("重置页面缓存失败:", error);
      toast.error("页面缓存重置失败", {
        description: "请稍后重试",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (quickPath: string) => {
    setPath(quickPath);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <RotateCcw className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">{label}</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>重置 ISR 页面缓存</DialogTitle>
          <DialogDescription>
            输入要重置缓存的页面路径，或选择下方快捷路径
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* 路径输入 */}
          <div className="space-y-2">
            <Label htmlFor="path">页面路径</Label>
            <Input
              id="path"
              placeholder="例如: /blog/my-post"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleRevalidate();
                }
              }}
            />
          </div>

          {/* 快捷路径 */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">快捷选择</Label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PATHS.map((item) => (
                <Button
                  key={item.path}
                  variant="secondary"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleQuickSelect(item.path)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 当前路径预览 */}
          {path && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs text-muted-foreground mb-1">将重置以下路径:</p>
              <code className="text-sm font-mono">
                {path.startsWith("/") ? path : `/${path}`}
              </code>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button onClick={handleRevalidate} disabled={loading || !path.trim()}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                重置中...
              </>
            ) : (
              "确认重置"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
