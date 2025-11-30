"use client";

import { useState } from "react";
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
} from "@/components/shadcn/ui/alert-dialog";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { revalidatePathAction } from "@/server/actions/revalidate-action";

// 路径映射配置
const PATH_MAPPING: Record<string, string | ((slug?: string) => string)> = {
  home: "/",
  blog: "/blog",
  "blog-detail": (slug?: string) => `/blog/${slug}`,
  projects: "/projects",
  "project-detail": (slug?: string) => `/projects/${slug}`,
  about: "/about",
  code: "/resources/code",
  "code-detail": (slug?: string) => `/resources/code/${slug}`,
  image: "/resources/image",
  "image-detail": (slug?: string) => `/resources/image/${slug}`,
  music: "/resources/music",
  "music-detail": (slug?: string) => `/resources/music/${slug}`,
};

interface RevalidateButtonProps {
  type: keyof typeof PATH_MAPPING;
  slug?: string;
  label?: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function RevalidateButton({
  type,
  slug,
  label = "刷新缓存",
  variant = "outline",
  size = "sm",
  className,
}: RevalidateButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPath = () => {
    const pathConfig = PATH_MAPPING[type];
    if (typeof pathConfig === "function") {
      return pathConfig(slug);
    }
    return pathConfig;
  };

  const handleRevalidate = async () => {
    setLoading(true);
    try {
      const path = getPath();
      const result = await revalidatePathAction(path);

      if (result.success) {
        toast.success("缓存刷新成功", {
          description: `路径: ${path}`,
        });
      } else {
        toast.error("缓存刷新失败", {
          description: result.error || "未知错误",
        });
      }
    } catch (error) {
      console.error("刷新缓存失败:", error);
      toast.error("缓存刷新失败", {
        description: "请稍后重试",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
        disabled={loading}
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {size !== "icon" && <span className="ml-2">{label}</span>}
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认刷新缓存</AlertDialogTitle>
            <AlertDialogDescription>
              您确定要刷新以下路径的缓存吗？
              <br />
              <code className="mt-2 block rounded bg-muted px-2 py-1 text-sm">
                {getPath()}
              </code>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleRevalidate} disabled={loading}>
              {loading ? "刷新中..." : "确认"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
