/**
 * 项目草稿数据类型
 */
export type ProjectDraft = {
  title: string;
  description: string;
  slug: string;
  content: string;
  image?: string;
  githubUrl?: string;
  demoUrl?: string;
  keyWords?: string;
}

/**
 * 项目草稿动作
 */
export type ProjectDraftAction = {
  setDraft: (draft: Partial<ProjectDraft>) => void;
  updateField: <K extends keyof ProjectDraft>(field: K, value: ProjectDraft[K]) => void;
  clearDraft: () => void;
  loadDraft: (draft: ProjectDraft) => void;
  markSaved: () => void;
}

/**
 * 项目草稿整体状态类型
 */
export type ProjectDraftState = {
  draft: ProjectDraft;
  isDirty: boolean; // 是否有未保存的更改
  lastSaved: Date | null; // 最后保存时间
} & ProjectDraftAction

/**
 * zustand持久化中间件类型
 */
export type PersistMiddlewares =
  [
    ['zustand/subscribeWithSelector', never],
    ['zustand/immer', never],
    ['zustand/devtools', never],
    ['zustand/persist', ProjectDraftState],
  ];

