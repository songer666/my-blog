import { createStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { UploadTask, UploadTaskState, Middlewares, UploadStatus } from "@/store/imageUpload/type";
import { useShallow } from "zustand/react/shallow";

const initTasks: UploadTask[] = [];

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 初始化状态
 * 使用中间件 createStore 创建的入参 creator
 */
const uploadTaskCreator: StateCreator<UploadTaskState, Middlewares> = (set, get) => ({
  tasks: initTasks,

  addTask: (task) => {
    const id = generateId();
    set(
      (state) => {
        state.tasks.push({
          ...task,
          id,
          status: 'pending',
          progress: 0,
        });
      },
      false,
      'imageUpload/addTask'
    );
    return id;
  },

  updateTaskStatus: (id, status, error) =>
    set(
      (state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          task.status = status;
          if (error) task.error = error;
        }
      },
      false,
      'imageUpload/updateStatus'
    ),

  updateTaskProgress: (id, progress) =>
    set(
      (state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          task.progress = Math.min(100, Math.max(0, progress));
        }
      },
      false,
      'imageUpload/updateProgress'
    ),

  updateTaskR2Key: (id, r2Key) =>
    set(
      (state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          task.r2Key = r2Key;
        }
      },
      false,
      'imageUpload/updateR2Key'
    ),

  removeTask: (id) =>
    set(
      (state) => {
        const index = state.tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          // 清理预览 URL
          const task = state.tasks[index];
          if (task.preview) {
            URL.revokeObjectURL(task.preview);
          }
          state.tasks.splice(index, 1);
        }
      },
      false,
      'imageUpload/removeTask'
    ),

  clearCompletedTasks: () =>
    set(
      (state) => {
        // 清理所有已完成任务的预览 URL
        state.tasks
          .filter((t) => t.status === 'success' || t.status === 'error')
          .forEach((t) => {
            if (t.preview) {
              URL.revokeObjectURL(t.preview);
            }
          });
        
        // 只保留进行中的任务
        state.tasks = state.tasks.filter(
          (t) => t.status === 'pending' || t.status === 'uploading'
        );
      },
      false,
      'imageUpload/clearCompleted'
    ),

  getTasksByGallery: (galleryId) => {
    return get().tasks.filter((t) => t.galleryId === galleryId);
  },

  getActiveTasks: () => {
    return get().tasks.filter(
      (t) => t.status === 'pending' || t.status === 'uploading'
    );
  },
});

/**
 * 状态池创建函数
 */
export const uploadTaskStore = createStore<UploadTaskState>(uploadTaskCreator, {
  name: 'image-upload-store',
});

/**
 * 创建 store 的钩子函数
 * @selector 为整个 zustand 方法构造器
 */
export function useUploadTaskStore<T>(selector: (state: UploadTaskState) => T): T {
  return useStore(uploadTaskStore, useShallow<UploadTaskState, T>(selector));
}
