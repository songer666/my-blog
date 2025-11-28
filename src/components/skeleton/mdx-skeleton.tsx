import { Skeleton } from "@/components/shadcn/ui/skeleton"

export function MdxContentSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 标题骨架 */}
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>

      {/* 段落骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>

      {/* 代码块骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>

      {/* 段落骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* 小标题骨架 */}
      <Skeleton className="h-6 w-2/3" />

      {/* 段落骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* 代码块骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* 段落骨架 */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}
