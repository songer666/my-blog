import React from "react";
import { getQueryClient, trpc } from "@/components/trpc/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { VideoTheater } from "@/components/admin/resources/video/video-theater";
import { UploadVideoDialog } from "@/components/admin/resources/video/upload-video-dialog";
import { VideoUploadTasks } from "@/components/admin/resources/video/video-upload-tasks";
import { CollectionBreadcrumb } from "@/components/admin/resources/video/collection-breadcrumb";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { ArrowLeft, Video, HardDrive } from "lucide-react";

interface CollectionDetailPageProps {
  params: Promise<{ id: string }>;
}

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params;
  const queryClient = getQueryClient();
  const collection = await queryClient.fetchQuery(trpc.videoCollection.byId.queryOptions({ id }));

  if (!collection) {
    notFound();
  }

  // 格式化文件大小
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 计算总时长
  const totalDuration = collection.items?.reduce((sum, item) => sum + (item.duration || 0), 0) || 0;
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <CollectionBreadcrumb collection={collection} />

      {/* 返回按钮 */}
      <Link href="/admin/dashboard/resources/video">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回视频集列表
        </Button>
      </Link>

      {/* 视频集信息 */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{collection.title}</h1>
            {!collection.isPublic && (
              <Badge variant="secondary">私密</Badge>
            )}
          </div>
          <p className="text-muted-foreground">{collection.slug}</p>
          {collection.description && (
            <p className="text-sm text-muted-foreground mt-2">
              {collection.description}
            </p>
          )}
        </div>
        <UploadVideoDialog collectionId={collection.id} />
      </div>

      {/* 关键词 */}
      {collection.keywords && collection.keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {collection.keywords.map((keyword, index) => (
            <Badge key={index} variant="outline">
              {keyword}
            </Badge>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">视频数量</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{collection.itemCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总大小</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(collection.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总时长</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalDuration > 0 ? formatDuration(totalDuration) : '0:00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 上传任务列表 */}
      <VideoUploadTasks collectionId={collection.id} />

      {/* 视频播放区域 */}
      <div className="mt-6">
        {collection.items && collection.items.length > 0 ? (
          <VideoTheater videos={collection.items} collectionId={collection.id} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
            <Video className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">还没有上传视频</p>
            <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
              点击右上角按钮上传视频文件
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
