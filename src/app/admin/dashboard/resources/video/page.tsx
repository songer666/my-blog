import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { CollectionList } from "@/components/admin/resources/video/collection-list";
import { CreateCollectionDialog } from "@/components/admin/resources/video/dialogs/create-collection-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Video } from "lucide-react";

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function VideoPage() {
  const queryClient = getQueryClient();
  const collections = await queryClient.fetchQuery(trpc.videoCollection.all.queryOptions());

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">视频管理</h1>
          <p className="text-muted-foreground mt-1">
            管理您的视频集和视频文件
          </p>
        </div>
        <CreateCollectionDialog />
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              视频集数量
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collections.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              视频总数
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {collections.reduce((sum, col) => sum + col.itemCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              存储空间
            </CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(collections.reduce((sum, col) => sum + col.totalSize, 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 视频集列表 */}
      <CollectionList collections={collections} />
    </div>
  );
}