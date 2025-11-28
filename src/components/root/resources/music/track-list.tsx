'use client';

import React from 'react';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';
import { Button } from '@/components/shadcn/ui/button';
import { Disc, Play, Pause } from 'lucide-react';
import { useMusicPlayerStore } from '@/store/music/store';
import type { MusicTrack } from '@/store/music/type';

interface Track {
  id: string;
  name: string;
  artist?: string | null;
  duration?: number | null;
  url: string | null;
}

interface TrackListProps {
  tracks: Track[];
  albumTitle: string;
  albumSlug: string;
  coverUrl?: string | null;
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

export function TrackList({ tracks, albumTitle, albumSlug, coverUrl }: TrackListProps) {
  const currentTrack = useMusicPlayerStore(state => state.currentTrack);
  const isPlaying = useMusicPlayerStore(state => state.isPlaying);
  const playTrack = useMusicPlayerStore(state => state.playTrack);
  const pause = useMusicPlayerStore(state => state.pause);
  const resume = useMusicPlayerStore(state => state.resume);

  const handleTrackClick = (track: Track) => {
    if (!track.url) return;

    const musicTrack: MusicTrack = {
      id: track.id,
      title: track.name,
      albumTitle,
      albumSlug,
      audioUrl: track.url,
      coverUrl,
      duration: track.duration || undefined,
    };

    // 构建完整播放列表
    const playlist: MusicTrack[] = tracks
      .filter(t => t.url)
      .map(t => ({
        id: t.id,
        title: t.name,
        albumTitle,
        albumSlug,
        audioUrl: t.url!,
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

  const isCurrentTrack = (trackId: string) => currentTrack?.id === trackId;
  const isCurrentTrackPlaying = (trackId: string) => isCurrentTrack(trackId) && isPlaying;

  return (
    <BlurFade delay={0.2} inView>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Disc className="w-5 h-5" />
            <span>歌曲列表</span>
          </div>
        </div>
        <div className={styles.list}>
          {tracks.map((track, index) => {
            const isCurrent = isCurrentTrack(track.id);
            const isCurrentPlaying = isCurrentTrackPlaying(track.id);

            return (
              <div
                key={track.id}
                className={`${styles.item} ${isCurrent ? styles.itemActive : ''}`}
                onClick={() => handleTrackClick(track)}
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
          })}
          {tracks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              暂无歌曲
            </div>
          )}
        </div>
      </div>
    </BlurFade>
  );
}
