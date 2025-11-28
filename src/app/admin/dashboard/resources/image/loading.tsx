export default function Loading() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse">
      {/* 页面头部骨架 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-4 w-64 bg-muted rounded"></div>
        </div>
        <div className="h-10 w-32 bg-muted rounded"></div>
      </div>

      {/* 统计卡片骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="h-4 w-20 bg-muted rounded mb-4"></div>
            <div className="h-8 w-24 bg-muted rounded"></div>
          </div>
        ))}
      </div>

      {/* Tabs 骨架 */}
      <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 w-24 bg-muted rounded"></div>
        ))}
      </div>

      {/* 图片网格骨架 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden">
            <div className="w-full aspect-square bg-muted"></div>
            <div className="p-3 space-y-2">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-muted rounded"></div>
                <div className="h-3 w-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
