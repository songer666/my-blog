/**
 * 博客文章草稿数据类型
 */
export type PostDraft = {
  title: string;
  description: string;
  slug: string;
  content: string;
  image?: string;
  keyWords?: string;
  tagIds: string[]; // 选中的标签ID数组
}

/**
 * 博客文章草稿动作
 */
export type PostDraftAction = {
  setDraft: (draft: Partial<PostDraft>) => void;
  updateField: <K extends keyof PostDraft>(field: K, value: PostDraft[K]) => void;
  addTag: (tagId: string) => void;
  removeTag: (tagId: string) => void;
  toggleTag: (tagId: string) => void;
  clearDraft: () => void;
  loadDraft: (draft: PostDraft) => void;
  markSaved: () => void;
}

/**
 * 博客文章草稿整体状态类型
 */
export type PostDraftState = {
  draft: PostDraft;
  isDirty: boolean; // 是否有未保存的更改
  lastSaved: Date | null; // 最后保存时间
} & PostDraftAction

/**
 * zustand持久化中间件类型
 */
export type PersistMiddlewares =
  [
    ['zustand/subscribeWithSelector', never],
    ['zustand/immer', never],
    ['zustand/devtools', never],
    ['zustand/persist', PostDraftState],
  ];
