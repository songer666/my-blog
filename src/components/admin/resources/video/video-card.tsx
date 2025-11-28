"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Play, Pause, Loader2, Trash2, Maximize, Volume2, VolumeX } from "lucide-react";
import { getSignedUrlAction } from "@/server/actions/resources/r2-action";
import type { CollectionVideoItem } from "@/server/types/resources-type";
import { DeleteVideoDialog } from "./dialogs/delete-video-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/shadcn/ui/collapsible";
import { Slider } from "@/components/shadcn/ui/slider";

const styles = {
  card: `overflow-hidden`.trim(),
  header: `p-4 flex items-start justify-between gap-4`.trim(),
  headerLeft: `flex-1 min-w-0`.trim(),
  title: `font-medium`.trim(),
  metadata: `flex flex-wrap gap-2 mt-2`.trim(),
  deleteButton: `flex-shrink-0`.trim(),
  deleteIcon: `h-4 w-4`.trim(),
  videoContainer: `relative bg-black aspect-video w-full group`.trim(),
  video: `w-full h-full`.trim(),
  controls: `absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity`.trim(),
  progressContainer: `mb-3 cursor-pointer`.trim(),
  progressBar: `h-1 w-full bg-white/30 rounded-full overflow-hidden`.trim(),
  progressFill: `h-full bg-primary transition-all`.trim(),
  controlsBottom: `flex items-center gap-3`.trim(),
  playBtn: `h-8 w-8 p-0`.trim(),
  timeText: `text-xs text-white min-w-[80px]`.trim(),
  volumeContainer: `flex items-center gap-2 flex-1 max-w-[120px]`.trim(),
  loading: `absolute inset-0 flex items-center justify-center bg-black/50`.trim(),
  error: `p-4 text-sm text-destructive`.trim(),
};

interface VideoCardProps {
  video: CollectionVideoItem;
  collectionId?: string;
}

export function VideoCard({ video, collectionId }: VideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.duration || 0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getSignedUrlAction(video.r2Key);
        if (result.success && result.signedUrl) {
          setVideoUrl(result.signedUrl);
        } else {
          setError(result.error || '加载视频失败');
        }
      } catch (err: any) {
        setError(err.message || '加载视频失败');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadVideo();
    }
  }, [video.r2Key, isOpen]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [videoUrl]);

  const togglePlay = async () => {
    const videoElement = videoRef.current;
    if (!videoElement || !videoUrl) return;

    try {
      if (isPlaying) {
        videoElement.pause();
        setIsPlaying(false);
      } else {
        await videoElement.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('播放失败:', err);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoElement.currentTime = pos * duration;
  };

  const toggleMute = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newMuted = !isMuted;
    videoElement.muted = newMuted;
    setIsMuted(newMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newVolume = value[0];
    videoElement.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      videoElement.muted = false;
    }
  };

  const toggleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoElement.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatResolution = (width?: number, height?: number) => {
    if (!width || !height) return undefined;
    return `${width}x${height}`;
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className={styles.card}>
          {/* 视频信息头部 */}
          <div className={styles.header}>
            <CollapsibleTrigger asChild>
              <div className={styles.headerLeft + " cursor-pointer"}>
                <h4 className={styles.title}>{video.name}</h4>
                <div className={styles.metadata}>
                  <Badge variant="secondary" className="text-xs">
                    {formatBytes(video.fileSize)}
                  </Badge>
                  {formatResolution(video.width, video.height) && (
                    <Badge variant="secondary" className="text-xs">
                      {formatResolution(video.width, video.height)}
                    </Badge>
                  )}
                  {video.duration && (
                    <Badge variant="secondary" className="text-xs">
                      {formatTime(video.duration)}
                    </Badge>
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            {/* 删除按钮 */}
            {collectionId && (
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                className={styles.deleteButton}
              >
                <Trash2 className={styles.deleteIcon} />
              </Button>
            )}
          </div>

          {/* 可折叠的视频播放器 */}
          <CollapsibleContent>
            <div className={styles.videoContainer}>
              {loading && (
                <div className={styles.loading}>
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
                  <p>{error}</p>
                </div>
              )}

              {videoUrl && !error && (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    className={styles.video}
                    onClick={togglePlay}
                  />

                  {/* 自定义控制栏 */}
                  <div className={styles.controls}>
                    {/* 进度条 */}
                    <div className={styles.progressContainer} onClick={handleProgressClick}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 控制按钮 */}
                    <div className={styles.controlsBottom}>
                      {/* 播放/暂停 */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={togglePlay}
                        className={styles.playBtn + " text-white hover:bg-white/20"}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>

                      {/* 时间 */}
                      <span className={styles.timeText}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>

                      {/* 音量控制 */}
                      <div className={styles.volumeContainer}>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={toggleMute}
                          className="h-8 w-8 p-0 text-white hover:bg-white/20"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          max={1}
                          step={0.1}
                          onValueChange={handleVolumeChange}
                          className="flex-1"
                        />
                      </div>

                      {/* 全屏 */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={toggleFullscreen}
                        className="h-8 w-8 p-0 text-white hover:bg-white/20 ml-auto"
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* 删除对话框 */}
      {collectionId && (
        <DeleteVideoDialog
          collectionId={collectionId}
          video={video}
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
        />
      )}
    </>
  );
}
