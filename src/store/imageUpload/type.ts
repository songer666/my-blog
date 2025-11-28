/**
 * 上传任务状态
 */
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * 单个上传任务
 */
export type UploadTask = {
  id: string; // 唯一标识
  galleryId: string; // 所属图库
  fileName: string; // 文件名
  fileSize: number; // 文件大小
  preview: string; // 预览 URL
  alt: string; // Alt 文本
  status: UploadStatus; // 状态
  progress: number; // 进度 0-100
  error?: string; // 错误信息
  r2Key?: string; // 上传成功后的 R2 Key
};

/**
 * 上传任务动作
 */
export type UploadTaskAction = {
  // 添加上传任务
  addTask: (task: Omit<UploadTask, 'id' | 'status' | 'progress'>) => string;
  
  // 更新任务状态
  updateTaskStatus: (id: string, status: UploadStatus, error?: string) => void;
  
  // 更新任务进度
  updateTaskProgress: (id: string, progress: number) => void;
  
  // 更新任务 R2 Key
  updateTaskR2Key: (id: string, r2Key: string) => void;
  
  // 移除任务
  removeTask: (id: string) => void;
  
  // 清空已完成的任务
  clearCompletedTasks: () => void;
  
  // 获取指定图库的任务
  getTasksByGallery: (galleryId: string) => UploadTask[];
  
  // 获取所有进行中的任务
  getActiveTasks: () => UploadTask[];
};

/**
 * 上传任务整体状态
 */
export type UploadTaskState = {
  tasks: UploadTask[];
} & UploadTaskAction;

/**
 * zustand 中间件类型
 */
export type Middlewares = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
  ['zustand/devtools', never]
];
