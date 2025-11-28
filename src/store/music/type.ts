/**
 * 音乐轨道信息
 */
export type MusicTrack = {
  id: string;
  title: string;
  albumTitle: string;
  albumSlug: string;
  audioUrl: string;
  coverUrl?: string | null;
  duration?: number;
}

/**
 * 循环模式
 */
export type LoopMode = 'off' | 'list' | 'one';

/**
 * 音乐播放器数据类型
 */
export type MusicPlayerData = {
  currentTrack: MusicTrack | null; // 当前播放的音乐
  playlist: MusicTrack[]; // 播放列表
  currentIndex: number; // 当前播放索引
  isPlaying: boolean; // 是否正在播放
  volume: number; // 音量 0-1
  currentTime: number; // 当前播放时间（秒）
  duration: number; // 总时长（秒）
  loopMode: LoopMode; // 循环模式
}

/**
 * 音乐播放器动作
 */
export type MusicPlayerAction = {
  playTrack: (track: MusicTrack, playlist?: MusicTrack[]) => void; // 播放指定音乐
  pause: () => void; // 暂停
  resume: () => void; // 继续播放
  stop: () => void; // 停止播放
  playNext: () => void; // 下一首
  playPrevious: () => void; // 上一首
  setVolume: (volume: number) => void; // 设置音量
  setCurrentTime: (time: number) => void; // 设置当前播放时间
  setDuration: (duration: number) => void; // 设置总时长
  setIsPlaying: (isPlaying: boolean) => void; // 设置播放状态
  toggleLoopMode: () => void; // 切换循环模式
  clear: () => void; // 清空播放器
}

/**
 * 音乐播放器整体状态类型
 */
export type MusicPlayerState = MusicPlayerData & MusicPlayerAction

/**
 * zustand持久化中间件类型
 */
export type PersistMiddlewares =
  [
    ['zustand/subscribeWithSelector', never],
    ['zustand/immer', never],
    ['zustand/devtools', never],
    ['zustand/persist', MusicPlayerState],
  ];
