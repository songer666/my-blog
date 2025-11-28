"use client";

import { useState } from "react";
import { VideoPlayer } from "./video-player";
import { VideoPlaylist } from "./video-playlist";
import type { CollectionVideoItem } from "@/server/types/resources-type";

interface VideoTheaterProps {
  videos: CollectionVideoItem[];
  collectionId: string;
}

export function VideoTheater({ videos, collectionId }: VideoTheaterProps) {
  const [currentVideo, setCurrentVideo] = useState<CollectionVideoItem | null>(
    videos.length > 0 ? videos[0] : null
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
      {/* 左侧：视频播放器 */}
      <div className="lg:col-span-2">
        <VideoPlayer video={currentVideo} />
      </div>

      {/* 右侧：播放列表 */}
      <div className="lg:col-span-1">
        <VideoPlaylist
          videos={videos}
          collectionId={collectionId}
          currentVideo={currentVideo}
          onVideoSelect={setCurrentVideo}
        />
      </div>
    </div>
  );
}
