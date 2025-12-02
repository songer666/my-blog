import { createPersistStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { MusicPlayerState, MusicTrack, PersistMiddlewares } from "@/store/music/type";
import { useShallow } from "zustand/react/shallow";

/**
 * 初始化状态
 */
const musicPlayerCreator: StateCreator<MusicPlayerState, PersistMiddlewares, [], MusicPlayerState> = (set, get) => ({
  currentTrack: null,
  playlist: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  loopMode: 'one',

  playTrack: (track: MusicTrack, playlist?: MusicTrack[]) => {
    const state = get();
    const newPlaylist = playlist || state.playlist;
    const index = newPlaylist.findIndex(t => t.id === track.id);
    
    set({
      currentTrack: track,
      playlist: newPlaylist,
      currentIndex: index,
      isPlaying: true,
      currentTime: 0,
    }, false, 'music/playTrack');
  },

  pause: () =>
    set({
      isPlaying: false,
    }, false, 'music/pause'),

  resume: () =>
    set({
      isPlaying: true,
    }, false, 'music/resume'),

  stop: () =>
    set({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }, false, 'music/stop'),

  playNext: () => {
    const state = get();
    const { playlist, currentIndex, loopMode } = state;
    
    if (playlist.length === 0) return;
    
    let nextIndex = currentIndex + 1;
    
    // 如果是列表循环模式，到末尾后回到开头
    if (nextIndex >= playlist.length) {
      if (loopMode === 'list') {
        nextIndex = 0;
      } else {
        return; // 不循环则停止
      }
    }
    
    const nextTrack = playlist[nextIndex];
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        currentIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
      }, false, 'music/playNext');
    }
  },

  playPrevious: () => {
    const state = get();
    const { playlist, currentIndex } = state;
    
    if (playlist.length === 0) return;
    
    let prevIndex = currentIndex - 1;
    
    // 如果到开头，循环到末尾
    if (prevIndex < 0) {
      prevIndex = playlist.length - 1;
    }
    
    const prevTrack = playlist[prevIndex];
    if (prevTrack) {
      set({
        currentTrack: prevTrack,
        currentIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
      }, false, 'music/playPrevious');
    }
  },

  setVolume: (volume: number) =>
    set({
      volume: Math.max(0, Math.min(1, volume)),
    }, false, 'music/setVolume'),

  setCurrentTime: (time: number) =>
    set({
      currentTime: time,
    }, false, 'music/setCurrentTime'),

  setDuration: (duration: number) =>
    set({
      duration,
    }, false, 'music/setDuration'),

  setIsPlaying: (isPlaying: boolean) =>
    set({
      isPlaying,
    }, false, 'music/setIsPlaying'),

  toggleLoopMode: () => {
    const state = get();
    const modes: Array<'off' | 'list' | 'one'> = ['off', 'list', 'one'];
    const currentModeIndex = modes.indexOf(state.loopMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    
    set({
      loopMode: nextMode,
    }, false, 'music/toggleLoopMode');
  },

  clear: () =>
    set({
      currentTrack: null,
      playlist: [],
      currentIndex: -1,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    }, false, 'music/clear'),

  refreshTrackUrl: async (trackId: string) => {
    const state = get();
    const { currentTrack, playlist } = state;
    
    // 找到需要刷新的音轨
    let trackToRefresh: MusicTrack | null = null;
    if (currentTrack?.id === trackId) {
      trackToRefresh = currentTrack;
    } else {
      trackToRefresh = playlist.find(t => t.id === trackId) || null;
    }
    
    if (!trackToRefresh) return;
    
    try {
      // 动态导入 server action
      const { getSignedUrlAction } = await import('@/server/actions/resources/r2-action');
      const result = await getSignedUrlAction(trackToRefresh.r2Key);
      
      if (result.success && result.signedUrl) {
        const newUrl = result.signedUrl as string;
        
        // 更新当前音轨
        if (currentTrack?.id === trackId) {
          set({
            currentTrack: {
              ...currentTrack,
              audioUrl: newUrl,
            },
          }, false, 'music/refreshTrackUrl/currentTrack');
        }
        
        // 更新播放列表中的音轨
        const newPlaylist = playlist.map(track =>
          track.id === trackId ? { ...track, audioUrl: newUrl } : track
        );
        
        set({
          playlist: newPlaylist,
        }, false, 'music/refreshTrackUrl/playlist');
        
        console.log(`音轨 ${trackId} URL 已刷新`);
      }
    } catch (error) {
      console.error('刷新音轨 URL 失败:', error);
    }
  },

  updateTrackUrl: (trackId: string, newUrl: string) => {
    const state = get();
    const { currentTrack, playlist } = state;
    
    // 更新当前音轨
    if (currentTrack?.id === trackId) {
      set({
        currentTrack: {
          ...currentTrack,
          audioUrl: newUrl,
        },
      }, false, 'music/updateTrackUrl/currentTrack');
    }
    
    // 更新播放列表中的音轨
    const newPlaylist = playlist.map(track =>
      track.id === trackId ? { ...track, audioUrl: newUrl } : track
    );
    
    set({
      playlist: newPlaylist,
    }, false, 'music/updateTrackUrl/playlist');
  },
});

/**
 * 状态池创建函数 - 使用持久化存储
 */
export const musicPlayerStore = createPersistStore<MusicPlayerState, MusicPlayerState>(
  musicPlayerCreator,
  {
    name: 'blog-music-player',
    // 持久化当前音乐、播放列表和音量
    partialize: (state) => ({ 
      currentTrack: state.currentTrack,
      playlist: state.playlist,
      currentIndex: state.currentIndex,
      volume: state.volume,
      isPlaying: state.isPlaying,
      currentTime: state.currentTime,
      duration: state.duration,
      loopMode: state.loopMode,
      playTrack: state.playTrack,
      pause: state.pause,
      resume: state.resume,
      stop: state.stop,
      playNext: state.playNext,
      playPrevious: state.playPrevious,
      setVolume: state.setVolume,
      setCurrentTime: state.setCurrentTime,
      setDuration: state.setDuration,
      setIsPlaying: state.setIsPlaying,
      toggleLoopMode: state.toggleLoopMode,
      clear: state.clear,
      refreshTrackUrl: state.refreshTrackUrl,
      updateTrackUrl: state.updateTrackUrl,
    }),
    // 恢复时，将 isPlaying 设为 false，避免自动播放
    merge: (persistedState, currentState) => {
      const persisted = persistedState as MusicPlayerState;
      return {
        ...currentState,
        ...persisted,
        isPlaying: false, // 页面加载时不自动播放
        currentTime: 0, // 重置播放时间
        duration: 0, // 重置时长，等待音频加载后更新
      };
    },
  },
  { 
    name: 'music-player-store' 
  }
);

/**
 * 创建store的钩子函数
 */
export function useMusicPlayerStore<T>(selector: (state: MusicPlayerState) => T): T {
  return useStore(musicPlayerStore, useShallow<MusicPlayerState, T>(selector));
}
