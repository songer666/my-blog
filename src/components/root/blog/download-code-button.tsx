"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Download, Loader2 } from "lucide-react";
import { downloadRepositoryZipAction } from "@/server/actions/resources/code-download-action";
import { toast } from "sonner";

const styles = {
  icon: `h-4 w-4`.trim(),
  spinIcon: `h-4 w-4 animate-spin`.trim(),
};

interface DownloadCodeButtonProps {
  repositoryId: string;
  repositoryName: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function DownloadCodeButton({ 
  repositoryId, 
  repositoryName,
  variant = "outline",
  size = "default",
  className
}: DownloadCodeButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const result = await downloadRepositoryZipAction(repositoryId);

      if (!result.success || !result.data) {
        throw new Error(result.error || "下载失败");
      }

      // 将 base64 转换为 Blob
      const binaryString = atob(result.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: "application/zip" });

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || `${repositoryName}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("下载成功");
    } catch (error: any) {
      console.error("下载失败:", error);
      toast.error(error.message || "下载失败");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isDownloading}
      className={`${className} 
        dark:bg-purple-500/80 dark:hover:bg-purple-600/80
        dark:text-white cursor-pointer
        dark:border-purple-600/30
        transition-all duration-200`}
    >
      {isDownloading ? (
        <Loader2 className={styles.spinIcon} />
      ) : (
        <Download className={styles.icon} />
      )}
      {isDownloading ? "下载中..." : "下载"}
    </Button>
  );
}
