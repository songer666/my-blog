'use client';

import React from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Disc, Play, Pause } from 'lucide-react';
import { useMusicPlayerStore } from '@/store/music/store';
import type { MusicTrack } from '@/store/music/type';
import { useR2Url } from '@/components/mdx/context/r2-url-context';

interface Track {
  id: string;
  name: string;
  r2Key: string;
  artist?: string | null;
  duration?: number | null;
  coverKey?: string;
}

interface TrackListProps {
  tracks: Track[];
  albumTitle: string;
  albumSlug: string;
  coverImage?: string | null;
  coverKey?: string;
}

const styles = {
  container: 'rounded-xl border border-border/60 bg-card overflow-hidden',
  header: 'px-6 py-4 border-b border-border/40 bg-muted/30 flex items-center justify-between',
  title: 'font-semibold flex items-center gap-2 text-lg',
  list: 'divide-y divide-border/40',
  item: 'px-4 py-3 flex items-center gap-4 hover:bg-muted/20 transition-colors group cursor-pointer',
  itemActive: 'bg-violet-500/10 dark:bg-violet-500/20',
  index: 'w-8 text-center text-sm text-muted-foreground font-mono',
  trackInfo: 'flex-1 min-w-0 flex flex-col',
  trackName: 'font-medium text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors',
  trackNameActive: 'text-violet-600 dark:text-violet-400 font-semibold',
  artist: 'text-xs text-muted-foreground truncate',
  duration: 'text-sm text-muted-foreground w-16 text-right font-mono',
  playButton: 'transition-opacity',
  playButtonActive: 'opacity-100',
};

function formatDuration(seconds?: number | null) {
  if (!seconds) return '--:--';
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// 单个音轨组件，使用 useR2Url 自动刷新
function TrackItem({ 
  track, 
  index, 
  albumTitle, 
  albumSlug, 
  coverImage, 
  coverKey,
  allTracks 
}: { 
  track: Track; 
  index: number; 
  albumTitle: string; 
  albumSlug: string; 
  coverImage?: string | null;
  coverKey?: string;
  allTracks: Track[];
}) {
  const url = useR2Url(track.r2Key); // 自动刷新的 URL
  const coverUrl = coverKey ? useR2Url(coverKey) : coverImage;
  
  const currentTrack = useMusicPlayerStore(state => state.currentTrack);
  const isPlaying = useMusicPlayerStore(state => state.isPlaying);
  const playTrack = useMusicPlayerStore(state => state.playTrack);
  const pause = useMusicPlayerStore(state => state.pause);
  const resume = useMusicPlayerStore(state => state.resume);

  const handleClick = () => {
    if (!url) return;

    const musicTrack: MusicTrack = {
      id: track.id,
      title: track.name,
      albumTitle,
      albumSlug,
      r2Key: track.r2Key,
      audioUrl: url,
      coverUrl,
      duration: track.duration || undefined,
    };

    // 构建完整播放列表（audioUrl 会在播放器中根据 r2Key 动态获取）
    const playlist: MusicTrack[] = allTracks.map(t => ({
      id: t.id,
      title: t.name,
      albumTitle,
      albumSlug,
      r2Key: t.r2Key,
      audioUrl: '', // 占位符,会在播放器中根据 r2Key 动态获取
      coverUrl,
      duration: t.duration || undefined,
    }));

    // 如果点击的是当前歌曲
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      // 播放新歌曲并传递播放列表
      playTrack(musicTrack, playlist);
    }
  };

  const isCurrent = currentTrack?.id === track.id;
  const isCurrentPlaying = isCurrent && isPlaying;

  return (
    <div
      className={`${styles.item} ${isCurrent ? styles.itemActive : ''}`}
      onClick={handleClick}
    >
      <span className={styles.index}>{index + 1}</span>
      <div className={styles.trackInfo}>
        <span className={`${styles.trackName} ${isCurrent ? styles.trackNameActive : ''}`}>
          {track.name}
        </span>
        {track.artist && (
          <span className={styles.artist}>{track.artist}</span>
        )}
      </div>
      <div className={styles.duration}>
        {formatDuration(track.duration)}
      </div>
      <div className={`${styles.playButton} ${isCurrent ? styles.playButtonActive : ''}`}>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full hover:bg-violet-500/20 dark:hover:bg-violet-500/30"
        >
          {isCurrentPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

export function TrackList({ tracks, albumTitle, albumSlug, coverImage, coverKey }: TrackListProps) {

  return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Disc className="w-5 h-5" />
            <span>歌曲列表</span>
          </div>
        </div>
        <div className={styles.list}>
          {tracks.map((track, index) => (
            <TrackItem
              key={track.id}
              track={track}
              index={index}
              albumTitle={albumTitle}
              albumSlug={albumSlug}
              coverImage={coverImage}
              coverKey={coverKey}
              allTracks={tracks}
            />
          ))}
          {tracks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              暂无歌曲
            </div>
          )}
        </div>
      </div>
  );
}
