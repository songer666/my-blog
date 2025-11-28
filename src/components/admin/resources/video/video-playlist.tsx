"use client";

import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { Trash2, Play } from "lucide-react";
import { useState } from "react";
import type { CollectionVideoItem } from "@/server/types/resources-type";
import { DeleteVideoDialog } from "./dialogs/delete-video-dialog";
import { cn } from "@/lib/utils";

const styles = {
  container: `h-full border rounded-lg bg-card`.trim(),
  header: `p-4 border-b`.trim(),
  title: `font-semibold text-lg`.trim(),
  videoItem: `p-3 border-b last:border-b-0 cursor-pointer hover:bg-accent/50 transition-colors`.trim(),
  videoItemActive: `bg-accent`.trim(),
  videoInfo: `flex items-start gap-3`.trim(),
  playIcon: `flex-shrink-0 mt-1`.trim(),
  videoDetails: `flex-1 min-w-0`.trim(),
  videoName: `font-medium text-sm line-clamp-2`.trim(),
  metadata: `flex flex-wrap gap-2 mt-1`.trim(),
  deleteBtn: `flex-shrink-0`.trim(),
  empty: `flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground`.trim(),
};

interface VideoPlaylistProps {
  videos: CollectionVideoItem[];
  collectionId: string;
  currentVideo: CollectionVideoItem | null;
  onVideoSelect: (video: CollectionVideoItem) => void;
}

export function VideoPlaylist({ videos, collectionId, currentVideo, onVideoSelect }: VideoPlaylistProps) {
  const [deleteVideo, setDeleteVideo] = useState<CollectionVideoItem | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (videos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <p className="text-lg font-medium">暂无视频</p>
          <p className="text-sm mt-1">上传视频后将在此显示</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>播放列表 ({videos.length})</h3>
        </div>
        
        <ScrollArea className="h-[calc(100%-60px)]">
          {videos.map((video) => (
            <div
              key={video.id}
              className={cn(
                styles.videoItem,
                currentVideo?.id === video.id && styles.videoItemActive
              )}
            >
              <div className={styles.videoInfo}>
                <div className={styles.playIcon}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => onVideoSelect(video)}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>

                <div
                  className={styles.videoDetails}
                  onClick={() => onVideoSelect(video)}
                >
                  <p className={styles.videoName}>{video.name}</p>
                  <div className={styles.metadata}>
                    {video.duration && (
                      <Badge variant="secondary" className="text-xs">
                        {formatTime(video.duration)}
                      </Badge>
                    )}
                    {video.width && video.height && (
                      <Badge variant="secondary" className="text-xs">
                        {video.width}x{video.height}
                      </Badge>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {formatBytes(video.fileSize)}
                    </Badge>
                  </div>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  className={styles.deleteBtn + " h-8 w-8"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteVideo(video);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* 删除对话框 */}
      {deleteVideo && (
        <DeleteVideoDialog
          collectionId={collectionId}
          video={deleteVideo}
          open={!!deleteVideo}
          onOpenChange={(open) => !open && setDeleteVideo(null)}
        />
      )}
    </>
  );
}
