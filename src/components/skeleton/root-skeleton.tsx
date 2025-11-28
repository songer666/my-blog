import {Skeleton} from "@/components/shadcn/ui/skeleton";

/**
 * 项目详情页面骨架屏
 * 用于项目详情页面的loading状态
 */
export function ProjectDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl pt-20 sm:pt-24">
            {/* 顶部按钮栏骨架 */}
            <div className="mb-8">
                <Skeleton className="h-10 w-32 bg-muted" />
            </div>

            {/* 项目头部骨架 */}
            <div className="mb-8">
                {/* 封面图片骨架 */}
                <Skeleton className="w-full h-64 md:h-96 mb-6 rounded-lg bg-muted" />

                {/* 标题骨架 */}
                <Skeleton className="h-12 w-3/4 mb-4 bg-muted" />

                {/* 描述骨架 */}
                <div className="space-y-2 mb-6">
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-5/6 bg-muted" />
                </div>

                {/* 链接骨架 */}
                <div className="flex gap-3 mb-6">
                    <Skeleton className="h-10 w-24 bg-muted" />
                    <Skeleton className="h-10 w-24 bg-muted" />
                </div>

                {/* 元信息骨架 */}
                <div className="flex items-center gap-4 mb-6">
                    <Skeleton className="h-4 w-48 bg-muted" />
                </div>

                <hr className="mt-8 border-t border-border" />
            </div>

            {/* 内容骨架 */}
            <div className="space-y-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-4/5 bg-muted" />
                        {i < 7 && <div className="h-4" />}
                    </div>
                ))}

                {/* 模拟代码块 */}
                <div className="my-6">
                    <Skeleton className="h-32 w-full rounded bg-muted" />
                </div>

                {/* 更多段落 */}
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i + 8} className="space-y-2">
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-full bg-muted" />
                        <Skeleton className="h-4 w-3/4 bg-muted" />
                        {i < 3 && <div className="h-4" />}
                    </div>
                ))}
            </div>

            {/* 底部按钮骨架 */}
            <div className="mt-8">
                <Skeleton className="h-10 w-32 bg-muted" />
            </div>
        </div>
    );
}

/**
 * 博客详情页面骨架屏
 * 用于文章详情页面的loading状态
 */
export function BlogDetailSkeleton() {
    return (
        <div className="container mx-auto py-6 max-w-7xl mt-20 sm:mt-24">
            {/* 顶部按钮栏骨架 */}
            <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-10 w-32 bg-muted" />
                <Skeleton className="h-10 w-24 bg-muted" />
            </div>

            {/* 文章头部信息卡片骨架 */}
            <div className="bg-card rounded-lg border p-6 mb-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* 左侧内容骨架 */}
                    <div className="flex-1">
                        {/* 标题骨架 */}
                        <Skeleton className="h-9 w-3/4 mb-4 bg-muted" />

                        {/* URL别名骨架 */}
                        <div className="flex items-center gap-1 mb-4">
                            <Skeleton className="w-4 h-4 bg-muted" />
                            <Skeleton className="h-4 w-40 bg-muted" />
                        </div>

                        {/* 文章元信息骨架 */}
                        <div className="flex flex-col gap-2 mb-4">
                            <div className="flex items-center gap-1">
                                <Skeleton className="w-4 h-4 bg-muted" />
                                <Skeleton className="h-4 w-48 bg-muted" />
                            </div>
                            <div className="flex items-center gap-1">
                                <Skeleton className="w-4 h-4 bg-muted" />
                                <Skeleton className="h-4 w-48 bg-muted" />
                            </div>
                            <div className="flex items-center gap-1">
                                <Skeleton className="h-6 w-16 rounded-full bg-muted" />
                            </div>
                        </div>

                        {/* 描述骨架 */}
                        <div className="space-y-2 mb-4">
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-5/6 bg-muted" />
                        </div>

                        {/* 标签骨架 */}
                        <div className="flex items-center gap-2 mb-4">
                            <Skeleton className="w-4 h-4 bg-muted" />
                            <div className="flex flex-wrap gap-1">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-5 w-12 rounded bg-muted" />
                                ))}
                            </div>
                        </div>

                        {/* 关键词骨架 */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-16 bg-muted" />
                            <Skeleton className="h-4 w-32 bg-muted" />
                        </div>
                    </div>

                    {/* 右侧封面图片骨架 */}
                    <div className="lg:flex-shrink-0">
                        <Skeleton className="w-full lg:w-80 h-48 lg:h-full rounded-lg bg-muted" />
                    </div>
                </div>
            </div>

            {/* 文章内容卡片骨架 */}
            <div className="bg-card rounded-lg border p-6">
                <div className="space-y-4">
                    {/* 模拟文章段落 */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-4/5 bg-muted" />
                            {i < 7 && <div className="h-4" />} {/* 段落间距 */}
                        </div>
                    ))}

                    {/* 模拟代码块 */}
                    <div className="my-6">
                        <Skeleton className="h-32 w-full rounded bg-muted" />
                    </div>

                    {/* 更多段落 */}
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i + 8} className="space-y-2">
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-full bg-muted" />
                            <Skeleton className="h-4 w-3/4 bg-muted" />
                            {i < 3 && <div className="h-4" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}