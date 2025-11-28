"use client";

import { Switch } from "@/components/shadcn/ui/switch";
import { PostWithTagsType } from "@/server/types/blog-type";
import { usePostAPI } from "@/client/blog/post-api";
import { toast } from "sonner";
import styles from './toggle-visible.module.css';
import { useRouter } from "next/navigation";

interface ToggleVisibleProps {
  post: PostWithTagsType;
}

/**
 * 切换博客文章可见性组件
 * @param post 文章对象
 */
export function ToggleVisible({ post }: ToggleVisibleProps) {
  const router = useRouter();
  const { useToggleVisibility } = usePostAPI();
  const toggleMutation = useToggleVisibility();

  const handleToggle = async (checked: boolean) => {
    try {
      const res = await toggleMutation.mutateAsync({ id: post.id });

      if (res.success) {
        toast.success('可见性更新成功', {
          position: 'top-center',
          description: `文章 ${post.title} 已${checked ? '发布' : '隐藏'}`
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
          checked={post.visible}
          onCheckedChange={handleToggle}
          disabled={toggleMutation.isPending}
          className={styles.switch}
        />
        <div className={styles.statusInfo}>
          <span className={`${styles.statusText} ${
            post.visible ? styles.visible : styles.hidden
          }`}>
            {post.visible ? '已发布' : '草稿'}
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

