/**
 * 上传任务状态
 */
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

/**
 * 单个音乐上传任务
 */
export type MusicUploadTask = {
  id: string; // 唯一标识
  albumId: string; // 所属专辑
  fileName: string; // 文件名
  fileSize: number; // 文件大小
  mimeType: string; // MIME 类型
  duration?: number; // 音乐时长（秒）
  title?: string; // 音乐标题
  artist?: string; // 艺术家
  album?: string; // 专辑名
  status: UploadStatus; // 状态
  progress: number; // 进度 0-100
  uploadedBytes: number; // 已上传字节
  uploadSpeed: number; // 上传速度（字节/秒）
  error?: string; // 错误信息
  r2Key?: string; // 上传成功后的 R2 Key
};

/**
 * 音乐上传任务动作
 */
export type MusicUploadTaskAction = {
  // 添加上传任务
  addTask: (task: Omit<MusicUploadTask, 'id' | 'status' | 'progress' | 'uploadedBytes' | 'uploadSpeed'>) => string;
  
  // 更新任务状态
  updateTaskStatus: (id: string, status: UploadStatus, error?: string) => void;
  
  // 更新任务进度和速度
  updateTaskProgress: (id: string, progress: number, uploadedBytes: number, uploadSpeed: number) => void;
  
  // 更新任务 R2 Key
  updateTaskR2Key: (id: string, r2Key: string) => void;
  
  // 更新任务元数据
  updateTaskMetadata: (id: string, metadata: { title?: string; artist?: string; album?: string; duration?: number }) => void;
  
  // 移除任务
  removeTask: (id: string) => void;
  
  // 清空已完成的任务
  clearCompletedTasks: () => void;
  
  // 获取指定专辑的任务
  getTasksByAlbum: (albumId: string) => MusicUploadTask[];
  
  // 获取所有进行中的任务
  getActiveTasks: () => MusicUploadTask[];
};

/**
 * 音乐上传任务整体状态
 */
export type MusicUploadTaskState = {
  tasks: MusicUploadTask[];
} & MusicUploadTaskAction;

/**
 * zustand 中间件类型
 */
export type Middlewares = [
  ['zustand/subscribeWithSelector', never],
  ['zustand/immer', never],
  ['zustand/devtools', never]
];
