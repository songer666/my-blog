import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  MusicUploadTask,
  MusicUploadTaskState,
  MusicUploadTaskAction,
  UploadStatus,
  Middlewares
} from './type';

const initialState = {
  tasks: [] as MusicUploadTask[],
};

const createActions = (
  set: (fn: (state: MusicUploadTaskState) => void) => void,
  get: () => MusicUploadTaskState
): MusicUploadTaskAction => ({
  // 添加上传任务
  addTask: (task) => {
    const id = `music-upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    set((state) => {
      state.tasks.push({
        ...task,
        id,
        status: 'pending',
        progress: 0,
        uploadedBytes: 0,
        uploadSpeed: 0,
      });
    });
    
    return id;
  },

  // 更新任务状态
  updateTaskStatus: (id, status, error) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.status = status;
        if (error) {
          task.error = error;
        }
      }
    });
  },

  // 更新任务进度和速度
  updateTaskProgress: (id, progress, uploadedBytes, uploadSpeed) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.progress = progress;
        task.uploadedBytes = uploadedBytes;
        task.uploadSpeed = uploadSpeed;
      }
    });
  },

  // 更新任务 R2 Key
  updateTaskR2Key: (id, r2Key) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        task.r2Key = r2Key;
      }
    });
  },

  // 更新任务元数据
  updateTaskMetadata: (id, metadata) => {
    set((state) => {
      const task = state.tasks.find(t => t.id === id);
      if (task) {
        if (metadata.title !== undefined) task.title = metadata.title;
        if (metadata.artist !== undefined) task.artist = metadata.artist;
        if (metadata.album !== undefined) task.album = metadata.album;
        if (metadata.duration !== undefined) task.duration = metadata.duration;
      }
    });
  },

  // 移除任务
  removeTask: (id) => {
    set((state) => {
      state.tasks = state.tasks.filter(t => t.id !== id);
    });
  },

  // 清空已完成的任务
  clearCompletedTasks: () => {
    set((state) => {
      state.tasks = state.tasks.filter(
        t => t.status !== 'success' && t.status !== 'error'
      );
    });
  },

  // 获取指定专辑的任务
  getTasksByAlbum: (albumId) => {
    return get().tasks.filter(t => t.albumId === albumId);
  },

  // 获取所有进行中的任务
  getActiveTasks: () => {
    return get().tasks.filter(
      t => t.status === 'pending' || t.status === 'uploading'
    );
  },
});

/**
 * 音乐上传任务 Store
 */
export const musicUploadTaskStore = create<MusicUploadTaskState, Middlewares>(
  subscribeWithSelector(
    immer(
      devtools((set, get) => ({
        ...initialState,
        ...createActions(set, get),
      }), { name: 'MusicUploadTaskStore' })
    )
  )
);

/**
 * Hook for using music upload task store
 */
export const useMusicUploadTaskStore = musicUploadTaskStore;
