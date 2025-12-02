'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMusicPlayerStore } from '@/store/music/store';
import { Play, Pause, X, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';
import { Slider } from '@/components/shadcn/ui/slider';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const currentTrack = useMusicPlayerStore(state => state.currentTrack);
  const isPlaying = useMusicPlayerStore(state => state.isPlaying);
  const volume = useMusicPlayerStore(state => state.volume);
  const currentTime = useMusicPlayerStore(state => state.currentTime);
  const duration = useMusicPlayerStore(state => state.duration);
  
  const pause = useMusicPlayerStore(state => state.pause);
  const resume = useMusicPlayerStore(state => state.resume);
  const clear = useMusicPlayerStore(state => state.clear);
  const playNext = useMusicPlayerStore(state => state.playNext);
  const playPrevious = useMusicPlayerStore(state => state.playPrevious);
  const setVolume = useMusicPlayerStore(state => state.setVolume);
  const setCurrentTime = useMusicPlayerStore(state => state.setCurrentTime);
  const setDuration = useMusicPlayerStore(state => state.setDuration);
  const setIsPlaying = useMusicPlayerStore(state => state.setIsPlaying);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 当切换歌曲时，重置时间和 duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    // 重置时间和 duration
    setCurrentTime(0);
    setDuration(0);
    
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
      
      return () => timers.forEach(timer => clearTimeout(timer));
    }
  }, [currentTrack, setCurrentTime, setDuration]);

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
        console.log('Duration loaded from metadata:', audio.duration);
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

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

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
    };
  }, [setCurrentTime, setDuration, setIsPlaying]);

  // 控制播放/暂停
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // 自动播放被阻止，静默处理
          if (err.name === 'NotAllowedError') {
            console.log('自动播放被阻止，等待用户交互');
            setIsPlaying(false);
          } else {
            console.error('播放失败:', err);
            setIsPlaying(false);
          }
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
        ref={audioRef}
        src={currentTrack.audioUrl}
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
