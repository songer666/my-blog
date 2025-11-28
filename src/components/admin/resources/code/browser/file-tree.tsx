"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RepositoryCodeItem } from "@/server/types/resources-type";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: Record<string, FileNode>;
  file?: RepositoryCodeItem;
}

interface FileTreeProps {
  files: RepositoryCodeItem[];
  selectedFile: RepositoryCodeItem | null;
  onSelectFile: (file: RepositoryCodeItem) => void;
}

/**
 * 从文件路径构建树形结构
 */
function buildFileTree(files: RepositoryCodeItem[]): FileNode[] {
  const root: Record<string, FileNode> = {};

  files.forEach(file => {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    parts.forEach((part: string, index: number) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      if (!current[part]) {
        current[part] = {
          name: part,
          path: currentPath,
          type: isFile ? 'file' : 'folder',
          children: isFile ? undefined : {},
          file: isFile ? file : undefined,
        };
      }

      if (!isFile && current[part].children) {
        current = current[part].children as Record<string, FileNode>;
      }
    });
  });

  // 转换为数组并排序（递归处理子节点）
  const sortRecord = (nodes: Record<string, FileNode>): void => {
    Object.values(nodes).forEach(node => {
      if (node.children) {
        sortRecord(node.children);
      }
    });
  };

  sortRecord(root);

  // 转换为数组并排序
  const toArray = (nodes: Record<string, FileNode>): FileNode[] => {
    return Object.values(nodes).sort((a, b) => {
      // 文件夹排在前面
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  return toArray(root);
}

/**
 * 文件树节点组件
 */
function TreeNode({
  node,
  level = 0,
  selectedFile,
  onSelectFile,
}: {
  node: FileNode;
  level?: number;
  selectedFile: RepositoryCodeItem | null;
  onSelectFile: (file: RepositoryCodeItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(level === 0); // 根目录默认展开

  const isSelected = selectedFile?.id === node.file?.id;

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsOpen(!isOpen);
    } else if (node.file) {
      onSelectFile(node.file);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-0.5 sm:gap-1 px-1 py-0.5 sm:px-2 sm:py-1 cursor-pointer hover:bg-accent rounded-sm transition-colors text-xs sm:text-sm",
          isSelected && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 8 + 4}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <>
            {isOpen ? (
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
            ) : (
              <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
            )}
            {isOpen ? (
              <FolderOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
            ) : (
              <Folder className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-purple-500 dark:text-purple-400" />
            )}
          </>
        ) : (
          <>
            <div className="w-3 sm:w-4" /> {/* 占位符 */}
            <File className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </div>

      {node.type === 'folder' && isOpen && node.children && (
        <div>
          {Object.values(node.children)
            .sort((a, b) => {
              // 文件夹排在前面
              if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
              }
              // 同类型按字母排序
              return a.name.localeCompare(b.name);
            })
            .map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
              />
            ))}
        </div>
      )}
    </div>
  );
}

/**
 * 文件树组件
 */
export function FileTree({ files, selectedFile, onSelectFile }: FileTreeProps) {
  const tree = buildFileTree(files);

  if (files.length === 0) {
    return (
      <div className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground text-center">
        暂无代码文件
      </div>
    );
  }

  return (
    <div className="py-1 sm:py-2">
      {tree.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      ))}
    </div>
  );
}
