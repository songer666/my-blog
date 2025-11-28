"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Badge } from "@/components/shadcn/ui/badge";
import { Slider } from "@/components/shadcn/ui/slider";
import { Play, Pause, Loader2, Trash2 } from "lucide-react";
import type { AlbumMusicItem } from "@/server/types/resources-type";
import { getSignedUrlAction } from "@/server/actions/resources/r2-action";
import { DeleteMusicDialog } from "./dialogs/delete-music-dialog";

const styles = {
  card: `group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg hover:border-primary/50`.trim(),
  playButton: `h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg transition-all group-hover:scale-110`.trim(),
  musicInfo: `flex-1 min-w-0`.trim(),
  title: `font-semibold truncate text-lg`.trim(),
  artist: `text-sm text-muted-foreground truncate`.trim(),
  metadata: `flex items-center gap-4 text-xs text-muted-foreground`.trim(),
  progressBar: `h-1 w-full bg-secondary rounded-full overflow-hidden`.trim(),
  progressFill: `h-full bg-primary transition-all`.trim(),
  deleteButton: `flex-shrink-0`.trim(),
  deleteIcon: `h-4 w-4`.trim(),
};

interface MusicCardProps {
  music: AlbumMusicItem;
  albumId?: string;
}

export function MusicCard({ music, albumId }: MusicCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(music.duration || 0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadAudio = async () => {
      setLoading(true);
      const result = await getSignedUrlAction(music.r2Key);
      if (result.success && result.signedUrl) {
        setAudioUrl(result.signedUrl);
      }
      setLoading(false);
    };

    loadAudio();
  }, [music.r2Key]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
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

  const formatBitrate = (bitrate?: number) => {
    if (!bitrate) return undefined;
    return `${Math.round(bitrate / 1000)} kbps`;
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* 播放按钮 */}
          <Button
            size="icon"
            variant="outline"
            onClick={togglePlay}
            disabled={!audioUrl || loading}
            className="flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          {/* 音乐信息 */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{music.name}</h4>
            {music.artist && (
              <p className="text-sm text-muted-foreground">{music.artist}</p>
            )}

            {/* 进度条 */}
            {audioUrl && (
              <div className="mt-2 space-y-1">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={0.1}
                  onValueChange={handleSeek}
                  disabled={!isPlaying && currentTime === 0}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            )}

            {/* 元数据 */}
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {formatBytes(music.fileSize)}
              </Badge>
              {music.bitrate && (
                <Badge variant="secondary" className="text-xs">
                  {formatBitrate(music.bitrate)}
                </Badge>
              )}
              {music.duration && (
                <Badge variant="secondary" className="text-xs">
                  {formatTime(music.duration)}
                </Badge>
              )}
            </div>
          </div>

          {/* 删除按钮 */}
          {albumId && (
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

        {/* 删除对话框 */}
        {albumId && (
          <DeleteMusicDialog
            albumId={albumId}
            music={music}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
          />
        )}

        {/* 隐藏的音频元素 */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            preload="metadata"
            className="hidden"
          />
        )}
      </CardContent>
    </Card>
  );
}
