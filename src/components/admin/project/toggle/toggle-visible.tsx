"use client";

import { Switch } from "@/components/shadcn/ui/switch";
import { ProjectType } from "@/server/types/project-type";
import { useProjectAPI } from "@/client/project-api";
import { toast } from "sonner";
import styles from './toggle-visible.module.css';
import { useRouter } from "next/navigation";

interface ToggleVisibleProps {
  project: ProjectType;
}

/**
 * 切换项目可见性组件
 * @param project 项目对象
 */
export function ToggleVisible({ project }: ToggleVisibleProps) {
  const router = useRouter();
  const { useToggleVisibility } = useProjectAPI();
  const toggleMutation = useToggleVisibility();

  const handleToggle = async (checked: boolean) => {
    try {
      const res = await toggleMutation.mutateAsync({ id: project.id });

      if (res.success) {
        toast.success('可见性更新成功', {
          position: 'top-center',
          description: `项目 ${project.title} 已${checked ? '发布' : '隐藏'}`
        });
        router.refresh();
      } else {
        toast.error('可见性更新失败', {
          position: 'top-center',
          description: '服务器返回了错误状态'
        });
      }
    } catch (error: any) {
      console.error('切换可见性错误:', error);
      
      toast.error('可见性更新失败', {
        position: 'top-center',
        description: error?.message || '网络错误，请稍后重试'
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.switchWrapper}>
        <Switch
          checked={project.visible}
          onCheckedChange={handleToggle}
          disabled={toggleMutation.isPending}
          className={styles.switch}
        />
        <div className={styles.statusInfo}>
          <span className={`${styles.statusText} ${
            project.visible ? styles.visible : styles.hidden
          }`}>
            {project.visible ? '已发布' : '草稿'}
          </span>
        </div>
      </div>
      
      {toggleMutation.isPending && (
        <div className={styles.loadingIndicator}>
          <span className={styles.loadingText}>更新中...</span>
        </div>
      )}
    </div>
  );
}

