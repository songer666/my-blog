import { Skeleton } from "@/components/shadcn/ui/skeleton";

/**
 * 总体加载
 */
export function Loading() {
    return (
        <div className="top-loader-wrap" aria-hidden>
            <div className="top-loader-bar animate-indeterminate1" />
            <div className="top-loader-bar animate-indeterminate2" />
        </div>
    );
}

/**
 * 头像骨架屏
 */
export function AvatarSkeleton({ className }: { className?: string }) {
  return (
    <Skeleton className={`rounded-full ${className || 'w-8 h-8'}`} />
  );
}

/**
 * 个人资料页面骨架屏
 * 用于ProfileMain组件的loading状态
 */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* 个人基本信息卡片骨架 */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-6 mb-6">
          {/* 头像骨架 */}
          <Skeleton className="size-24 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            {/* 姓名和职位骨架 */}
            <div className="space-y-2">
              <Skeleton className="h-8 w-32 bg-muted" />
              <Skeleton className="h-6 w-48 bg-muted" />
            </div>
            {/* 联系信息骨架 */}
            <div className="flex gap-4">
              <Skeleton className="h-4 w-40 bg-muted" />
            </div>
          </div>
        </div>
        {/* 个人简介骨架 */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24 bg-muted" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-3/4 bg-muted" />
          </div>
        </div>
      </div>

      {/* 社交链接卡片骨架 */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <Skeleton className="h-6 w-20 mb-4 bg-muted" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
              <Skeleton className="size-5 rounded bg-muted" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-16 bg-muted" />
                <Skeleton className="h-3 w-24 bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 教育经历卡片骨架 */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="size-5 bg-muted" />
          <Skeleton className="h-6 w-20 bg-muted" />
        </div>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i}>
              <div className="flex items-start gap-4">
                <Skeleton className="size-12 rounded-lg bg-muted" />
                <div className="flex-1 flex items-start justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32 bg-muted" />
                    <Skeleton className="h-4 w-40 bg-muted" />
                  </div>
                  <Skeleton className="h-4 w-20 bg-muted" />
                </div>
              </div>
              {i === 0 && <div className="my-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {/* 技能专长卡片骨架 */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="size-5 bg-muted" />
          <Skeleton className="h-6 w-20 bg-muted" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {/* 分类标题骨架 */}
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 bg-muted" />
                <Skeleton className="h-4 w-16 bg-muted" />
              </div>
              {/* 技能标签骨架 */}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
                  <Skeleton key={j} className="h-7 w-20 rounded-md bg-muted" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
