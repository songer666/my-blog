/**
 * 上传任务状态
 */
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * 单个视频上传任务
 */
export type VideoUploadTask = {
  id: string; // 唯一标识
  collectionId: string; // 所属视频集
  fileName: string; // 文件名
  fileSize: number; // 文件大小
  mimeType: string; // MIME 类型
  duration?: number; // 视频时长（秒）
  width?: number; // 视频宽度
  height?: number; // 视频高度
  title?: string; // 视频标题
  status: UploadStatus; // 状态
  progress: number; // 进度 0-100
  uploadedBytes: number; // 已上传字节
  uploadSpeed: number; // 上传速度（字节/秒）
  error?: string; // 错误信息
  r2Key?: string; // 上传成功后的 R2 Key
  coverKey?: string; // 封面图 R2 Key
};

/**
 * 视频上传任务动作
 */
export type VideoUploadTaskAction = {
  // 添加上传任务
  addTask: (task: Omit<VideoUploadTask, 'id' | 'status' | 'progress' | 'uploadedBytes' | 'uploadSpeed'>) => string;
  
  // 更新任务状态
  updateTaskStatus: (id: string, status: UploadStatus, error?: string) => void;
  
  // 更新任务进度和速度
  updateTaskProgress: (id: string, progress: number, uploadedBytes: number, uploadSpeed: number) => void;
  
  // 更新任务 R2 Key
  updateTaskR2Key: (id: string, r2Key: string) => void;
  
  // 更新任务元数据
  updateTaskMetadata: (id: string, metadata: { title?: string; duration?: number; width?: number; height?: number; coverKey?: string }) => void;
  
  // 移除任务
  removeTask: (id: string) => void;
  
  // 清空已完成的任务
  clearCompletedTasks: () => void;
  
  // 获取指定视频集的任务
  getTasksByCollection: (collectionId: string) => VideoUploadTask[];
  
  // 获取所有进行中的任务
  getActiveTasks: () => VideoUploadTask[];
};

/**
 * 视频上传任务整体状态
 */
export type VideoUploadTaskState = {
  tasks: VideoUploadTask[];
} & VideoUploadTaskAction;

/**
 * zustand 中间件类型
 */
export type Middlewares = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
  ['zustand/devtools', never]
];
