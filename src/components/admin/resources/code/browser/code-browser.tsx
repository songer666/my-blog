"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FileTree } from "./file-tree";
import { CodeViewer } from "./code-viewer";
import { Button } from "@/components/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/ui/popover";
import { Code2, Copy, Check, FolderTree, WrapText, ArrowRightLeft } from "lucide-react";
import { toast } from "sonner";
import type { RepositoryCodeItem } from "@/server/types/resources-type";

const styles = {
  // 响应式容器：手机端隐藏侧边栏，平板端缩小侧边栏，电脑端正常显示
  container: `flex flex-col sm:flex-row h-[calc(100vh-12rem)] sm:h-[calc(100vh-18rem)] lg:h-[calc(100vh-20rem)] border rounded-lg overflow-hidden relative max-w-full bg-background`.trim(),
  // 侧边栏：手机端隐藏，平板端缩小，电脑端正常
  sidebar: `hidden sm:block sm:w-48 lg:w-64 border-r overflow-y-auto flex-shrink-0 bg-background`.trim(),
  // 头部：响应式padding和字体
  header: `px-2 py-2 sm:px-3 sm:py-2 lg:px-4 lg:py-3 border-b font-medium text-xs sm:text-sm bg-background flex-shrink-0 flex items-center justify-between`.trim(),
  headerPath: `flex-1 truncate`.trim(),
  // 按钮组：手机端隐藏文字，只显示图标
  buttonGroup: `flex items-center gap-1 flex-shrink-0`.trim(),
  iconButton: `flex-shrink-0`.trim(),
  copyButtonText: `hidden sm:inline`.trim(),
  content: `flex-1 flex flex-col min-w-0 w-full sm:w-0 overflow-hidden bg-background`.trim(),
  codeArea: `flex-1 overflow-auto p-2 sm:p-3 lg:p-4 w-full bg-background`.trim(),
  emptyState: `flex flex-col items-center justify-center h-full text-muted-foreground`.trim(),
  emptyIcon: `w-12 h-12 sm:w-16 sm:h-16 mb-4 opacity-50`.trim(),
  emptyTitle: `text-base sm:text-lg font-medium`.trim(),
  emptyDescription: `text-xs sm:text-sm mt-2`.trim(),
  // 浮动按钮容器：手机端固定在右下角
  floatingContainer: `fixed bottom-28 right-6 sm:hidden z-50`.trim(),
  // 浮动按钮样式
  floatingButton: `shadow-lg rounded-full w-14 h-14 p-0`.trim(),
  popoverContent: `w-[280px] max-h-[60vh] overflow-y-auto p-0`.trim(),
};

interface CodeBrowserProps {
  files: RepositoryCodeItem[];
}

export function CodeBrowser({ files }: CodeBrowserProps) {
  const [selectedFile, setSelectedFile] = useState<RepositoryCodeItem | null>(
    files.length > 0 ? files[0] : null
  );
  const [copied, setCopied] = useState(false);
  const [codeContent, setCodeContent] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wrapMode, setWrapMode] = useState(false); // false=溢出滚动, true=自动换行

  // 设置代码内容用于复制
  useEffect(() => {
    if (!selectedFile) {
      setCodeContent("");
      return;
    }
    // 直接从文件对象获取内容（兼容旧数据）
    setCodeContent(selectedFile.content || "");
  }, [selectedFile]);

  const handleCopy = async () => {
    if (!codeContent) {
      toast.error('没有可复制的内容');
      return;
    }

    try {
      await navigator.clipboard.writeText(codeContent);
      setCopied(true);
      toast.success('代码已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('复制失败');
    }
  };

  if (files.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center justify-center text-muted-foreground text-center">
          <Code2 className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>还没有上传代码文件</p>
          <p className={styles.emptyDescription}>
            点击上方"上传代码"按钮添加代码文件
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        {/* 左侧文件树 - 平板和电脑端显示 */}
        <div className={styles.sidebar}>
          <FileTree
            files={files}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
          />
        </div>

        {/* 右侧代码查看器 */}
        <div className={styles.content}>
        {selectedFile ? (
          <>
            {/* 固定的文件路径头部 + 按钮组 */}
            <div className={styles.header}>
              <span className={styles.headerPath}>{selectedFile.path}</span>
              <div className={styles.buttonGroup}>
                {/* 换行/溢出切换按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.iconButton}
                  onClick={() => setWrapMode(!wrapMode)}
                  title={wrapMode ? "切换到滚动模式" : "切换到换行模式"}
                >
                  {wrapMode ? (
                    <ArrowRightLeft className="h-4 w-4" />
                  ) : (
                    <WrapText className="h-4 w-4" />
                  )}
                </Button>
                {/* 复制按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={styles.iconButton}
                  onClick={handleCopy}
                  disabled={!codeContent}
                  title={copied ? "已复制" : "复制代码"}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            {/* 可滚动的代码区域 */}
            <div className={styles.codeArea}>
              {selectedFile.content || selectedFile.r2Key ? (
                <CodeViewer
                  content={selectedFile.content || "// 旧数据格式，请重新上传此文件"}
                  language={selectedFile.language}
                  wrapMode={wrapMode}
                />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>代码内容不可用</p>
                  <p className="text-sm mt-2">这是旧数据格式，请删除并重新上传此文件</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <Code2 className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>请选择一个文件</p>
          </div>
        )}
      </div>
      </div>

      {/* 手机端浮动文件树按钮 - 使用 Portal 渲染到 body，避免被父容器 transform 影响 */}
      {typeof document !== 'undefined' && createPortal(
        <div className={styles.floatingContainer}>
          <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                className={styles.floatingButton}
                title="文件列表"
              >
                <FolderTree className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              side="top" 
              align="end" 
              className={styles.popoverContent}
              sideOffset={8}
            >
              <div className="px-3 py-2 border-b font-semibold text-sm">
                文件列表
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                <FileTree
                  files={files}
                  selectedFile={selectedFile}
                  onSelectFile={(file) => {
                    setSelectedFile(file);
                    setMobileMenuOpen(false);
                  }}
                />
              </div>
            </PopoverContent>
          </Popover>
        </div>,
        document.body
      )}
    </>
  );
}
