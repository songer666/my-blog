'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMusicPlayerStore, musicPlayerStore } from '@/store/music/store';
import { Play, Pause, X, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/shadcn/ui/slider';
import { useR2UrlWithRefresh } from '@/components/mdx/context/r2-url-context';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const currentTrack = useMusicPlayerStore(state => state.currentTrack);
  const isPlaying = useMusicPlayerStore(state => state.isPlaying);
  const volume = useMusicPlayerStore(state => state.volume);
  const currentTime = useMusicPlayerStore(state => state.currentTime);
  const duration = useMusicPlayerStore(state => state.duration);
  const loopMode = useMusicPlayerStore(state => state.loopMode);
  const playNext = useMusicPlayerStore(state => state.playNext);
  const playPrevious = useMusicPlayerStore(state => state.playPrevious);
  const pause = useMusicPlayerStore(state => state.pause);
  const resume = useMusicPlayerStore(state => state.resume);
  const clear = useMusicPlayerStore(state => state.clear);
  const setVolume = useMusicPlayerStore(state => state.setVolume);
  const setCurrentTime = useMusicPlayerStore(state => state.setCurrentTime);
  const setDuration = useMusicPlayerStore(state => state.setDuration);
  const setIsPlaying = useMusicPlayerStore(state => state.setIsPlaying);
  const refreshTrackUrl = useMusicPlayerStore(state => state.refreshTrackUrl);
  const updateTrackUrl = useMusicPlayerStore(state => state.updateTrackUrl);

  // 动态获取当前 track 的 URL
  const { url: dynamicUrl, refresh: refreshUrl } = useR2UrlWithRefresh(currentTrack?.r2Key || '');

  // 使用动态 URL 或 fallback 到 track 中的 URL
  const audioUrl = dynamicUrl || currentTrack?.audioUrl || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 当歌曲切换时，重置播放状态并加载音频
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // 如果 URL 还没加载,等待
    if (!audioUrl) {
      return;
    }
    
    // 强制更新 audio src
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
    }

    // 先暂停当前播放
    audio.pause();
    
    // 重置时间和 duration
    setCurrentTime(0);
    setDuration(0);
    
    // 加载新音频
    audio.load();
    
    // 等待音频可以播放后再开始播放
    const handleCanPlay = () => {
      // 获取最新的 isPlaying 状态
      const currentIsPlaying = musicPlayerStore.getState().isPlaying;
      if (currentIsPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            setIsPlaying(false);
          });
        }
      }
    };
    
    // 监听加载错误
    const handleLoadError = () => {
      setIsPlaying(false);
    };
    
    // 监听 canplay 事件
    audio.addEventListener('canplay', handleCanPlay, { once: true });
    audio.addEventListener('error', handleLoadError, { once: true });
    
    // 尝试获取 duration（多次尝试）
    const checkDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
        return true;
      }
      return false;
    };

    // 立即检查
    if (!checkDuration()) {
      // 如果还没有，多次尝试
      const timers: NodeJS.Timeout[] = [];
      [100, 300, 500, 1000].forEach(delay => {
        timers.push(setTimeout(checkDuration, delay));
      });
      
      return () => {
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleLoadError);
        timers.forEach(timer => clearTimeout(timer));
      };
    }
    
    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleLoadError);
    };
  }, [currentTrack, audioUrl, setCurrentTime, setDuration, setIsPlaying]); // audioUrl 变化时重新加载

  // 音频元素事件处理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleCanPlay = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const handleEnded = () => {
      // 单曲循环：自动重播当前歌曲
      audio.currentTime = 0;
      audio.play();
    };

    const handleError = async () => {
      setIsPlaying(false);
      
      // 如果有当前音轨，尝试刷新 URL
      if (currentTrack) {
        try {
          await refreshTrackUrl(currentTrack.id);
        } catch (error) {
          // 静默处理错误
        }
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    // 如果已经加载了，立即设置
    if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
      setDuration(audio.duration);
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack, setCurrentTime, setDuration, setIsPlaying, refreshTrackUrl]);

  // 控制播放/暂停
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // 自动播放被阻止或播放失败，静默处理
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack, setIsPlaying]);

  // 控制音量
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  // 格式化时间
  const formatTime = (seconds: number | undefined) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 进度条拖动
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = value[0];
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // 切换播放/暂停
  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  // 切换静音
  const toggleMute = () => {
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.7);
    }
  };


  if (!isMounted || !currentTrack) return null;

  return (
    <div className="fixed max-w-7xl mx-auto bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-card/95 backdrop-blur-md shadow-lg">
      <audio
        key={currentTrack.id}
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
      />
      
      {/* 关闭按钮 - 绝对定位在右上角 */}
      <button
        onClick={clear}
        className="absolute top-1 right-2 text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400 transition-colors z-10"
        title="关闭播放器"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="px-4 py-2">
        {/* 上半部分：信息和控制 - max-w-7xl */}
        <div className="max-w-7xl mx-auto flex items-center gap-4 mb-2">
          {/* 左侧：封面和信息 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack.coverUrl && (
              <div className="w-14 h-14 rounded overflow-hidden bg-muted shrink-0">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-foreground truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentTrack.albumTitle}
              </p>
            </div>
          </div>

          {/* 中间：播放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={playPrevious}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-foreground"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-600 text-white flex items-center justify-center transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <button
              onClick={playNext}
              className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors text-foreground"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* 右侧：音量控制 */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {volume === 0 ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <Slider
                value={[volume * 100]}
                max={100}
                step={1}
                onValueChange={(value) => setVolume(value[0] / 100)}
                className="w-20"
              />
            </div>
          </div>
        </div>

        {/* 下半部分：进度条 - 占满宽度 */}
        <div className="flex items-center gap-2 w-full px-4">
          <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10 text-left tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
