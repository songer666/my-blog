"use client";

import { useState } from "react";
import { MusicTable } from "./music-table";
import { MusicPlayerBar } from "./music-player-bar";
import type { AlbumMusicItem } from "@/server/types/resources-type";

interface MusicPlayerWithTableProps {
  musics: AlbumMusicItem[];
  albumId: string;
}

export function MusicPlayerWithTable({ musics, albumId }: MusicPlayerWithTableProps) {
  const [currentMusic, setCurrentMusic] = useState<AlbumMusicItem | null>(
    musics.length > 0 ? musics[0] : null
  );
  const [isPlaying, setIsPlaying] = useState(false);

  const handleNext = () => {
    if (!currentMusic || musics.length === 0) return;
    
    const currentIndex = musics.findIndex((m) => m.id === currentMusic.id);
    const nextIndex = (currentIndex + 1) % musics.length;
    setCurrentMusic(musics[nextIndex]);
  };

  const handlePrevious = () => {
    if (!currentMusic || musics.length === 0) return;
    
    const currentIndex = musics.findIndex((m) => m.id === currentMusic.id);
    const previousIndex = currentIndex === 0 ? musics.length - 1 : currentIndex - 1;
    setCurrentMusic(musics[previousIndex]);
  };

  const handleMusicSelect = (music: AlbumMusicItem) => {
    if (currentMusic?.id === music.id) {
      // 如果点击当前歌曲，切换播放/暂停
      setIsPlaying(!isPlaying);
    } else {
      // 选择新歌曲
      setCurrentMusic(music);
      setIsPlaying(true);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <MusicTable
        musics={musics}
        albumId={albumId}
        currentMusic={currentMusic}
        isPlaying={isPlaying}
        onMusicSelect={handleMusicSelect}
        onPlayPause={handlePlayPause}
      />

      <MusicPlayerBar
        music={currentMusic}
        musics={musics}
        onNext={musics.length > 1 ? handleNext : undefined}
        onPrevious={musics.length > 1 ? handlePrevious : undefined}
        onPlayingChange={setIsPlaying}
      />
    </div>
  );
}
