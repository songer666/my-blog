"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Slider } from "@/components/shadcn/ui/slider";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";
import type { AlbumMusicItem } from "@/server/types/resources-type";
import { getSignedUrlAction } from "@/server/actions/resources/r2-action";

const styles = {
  container: `fixed bottom-0 left-0 right-0 bg-card border-t backdrop-blur-lg bg-opacity-95 z-40`.trim(),
  content: `container mx-auto px-4 py-3`.trim(),
  mainRow: `flex items-center gap-4`.trim(),
  musicInfo: `flex-1 min-w-0 flex items-center gap-3`.trim(),
  cover: `h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0`.trim(),
  textInfo: `flex-1 min-w-0`.trim(),
  title: `font-medium truncate`.trim(),
  artist: `text-sm text-muted-foreground truncate`.trim(),
  controls: `flex items-center gap-2`.trim(),
  playButton: `h-10 w-10`.trim(),
  skipButton: `h-8 w-8`.trim(),
  progressSection: `flex-1 flex items-center gap-3 max-w-md`.trim(),
  timeText: `text-xs text-muted-foreground font-mono min-w-[45px]`.trim(),
  volumeSection: `flex items-center gap-2 min-w-[120px]`.trim(),
  volumeButton: `h-8 w-8`.trim(),
};

interface MusicPlayerBarProps {
  music: AlbumMusicItem | null;
  musics: AlbumMusicItem[];
  onNext?: () => void;
  onPrevious?: () => void;
  onPlayingChange?: (isPlaying: boolean) => void;
}

export function MusicPlayerBar({
  music,
  musics,
  onNext,
  onPrevious,
  onPlayingChange,
}: MusicPlayerBarProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const loadingRef = useRef(false);
  const shouldAutoPlayRef = useRef(false); // 记录是否应该自动播放
  const isPlayingRef = useRef(isPlaying);

  // 同步 isPlaying 状态到 ref
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 清理函数
  const cleanup = (savePlayingState = false) => {
    // 如果需要保存播放状态（用于切换歌曲时自动播放）
    if (savePlayingState && isPlayingRef.current) {
      shouldAutoPlayRef.current = true;
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    loadingRef.current = false;
  };

  // 加载音频
  useEffect(() => {
    if (!music) {
      cleanup();
      return;
    }

    const loadAudio = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      setLoading(true);
      try {
        const result = await getSignedUrlAction(music.r2Key);
        if (result.success && result.signedUrl) {
          setAudioUrl(result.signedUrl);
        }
      } catch (err) {
        console.error('加载音频失败:', err);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    loadAudio();

    return () => {
      cleanup(true); // 保存播放状态
    };
  }, [music?.id]);

  // 音频事件处理
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) return;

    const handleTimeUpdate = () => setCurrentTime(audioElement.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration);
      setLoading(false);
      
      // 如果应该自动播放，则开始播放
      if (shouldAutoPlayRef.current) {
        shouldAutoPlayRef.current = false;
        audioElement.play().catch(err => {
          console.error('自动播放失败:', err);
        });
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      // 播放下一首
      if (onNext) {
        onNext();
      }
    };
    const handleError = (e: Event) => {
      console.error('音频加载错误:', e);
      setLoading(false);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('play', handlePlay);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('play', handlePlay);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [audioUrl, onNext]);

  // 播放/暂停
  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (!audioElement || !audioUrl) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play().catch(err => {
        console.error('播放失败:', err);
      });
    }
  };

  // 同步播放状态给父组件
  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  // 进度条拖动
  const handleSeek = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;
    audioElement.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  // 音量控制
  const handleVolumeChange = (value: number[]) => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newVolume = value[0];
    audioElement.volume = newVolume;
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
      audioElement.muted = false;
    }
  };

  const toggleMute = () => {
    const audioElement = audioRef.current;
    if (!audioElement) return;

    const newMuted = !isMuted;
    audioElement.muted = newMuted;
    setIsMuted(newMuted);
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!music) {
    return null;
  }

  return (
    <>
      {/* 隐藏的音频元素 */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.mainRow}>
            {/* 音乐信息 */}
            <div className={styles.musicInfo}>
              <div className={styles.cover}>
                <span className="text-2xl">🎵</span>
              </div>
              <div className={styles.textInfo}>
                <div className={styles.title}>{music.name}</div>
                {music.artist && (
                  <div className={styles.artist}>{music.artist}</div>
                )}
              </div>
            </div>

            {/* 播放控制 */}
            <div className={styles.controls}>
              <Button
                size="icon"
                variant="ghost"
                className={styles.skipButton}
                onClick={onPrevious}
                disabled={!onPrevious}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="default"
                className={styles.playButton}
                onClick={togglePlay}
                disabled={!audioUrl || loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>

              <Button
                size="icon"
                variant="ghost"
                className={styles.skipButton}
                onClick={onNext}
                disabled={!onNext}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* 进度条 */}
            <div className={styles.progressSection}>
              <span className={styles.timeText}>{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={0.1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className={styles.timeText}>{formatTime(duration)}</span>
            </div>

            {/* 音量控制 */}
            <div className={styles.volumeSection}>
              <Button
                size="icon"
                variant="ghost"
                className={styles.volumeButton}
                onClick={toggleMute}
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
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 底部占位，避免内容被播放器遮挡 */}
      <div className="h-20" />
    </>
  );
}
