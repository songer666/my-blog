import { createPersistStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { ProjectDraft, ProjectDraftState, PersistMiddlewares } from "@/store/project/type";
import { useShallow } from "zustand/react/shallow";

// 初始化草稿数据
const initDraft: ProjectDraft = {
  title: '',
  description: '',
  slug: '',
  content: '',
  image: '',
  githubUrl: '',
  demoUrl: '',
  keyWords: '',
};

/**
 * 初始化状态
 */
const projectDraftCreator: StateCreator<ProjectDraftState, PersistMiddlewares, [], ProjectDraftState> = (set) => ({
  draft: initDraft,
  isDirty: false,
  lastSaved: null,

  setDraft: (newDraft: Partial<ProjectDraft>) =>
    set(state => {
      state.draft = { ...state.draft, ...newDraft };
      state.isDirty = true;
    }, false, 'projects/setDraft'),

  updateField: <K extends keyof ProjectDraft>(field: K, value: ProjectDraft[K]) =>
    set(state => {
      state.draft[field] = value;
      state.isDirty = true;
    }, false, 'projects/updateField'),

  clearDraft: () =>
    set(state => {
      state.draft = { ...initDraft };
      state.isDirty = false;
      state.lastSaved = null;
    }, false, 'projects/clearDraft'),

  loadDraft: (draft: ProjectDraft) =>
    set(state => {
      state.draft = { ...draft };
      state.isDirty = false;
      state.lastSaved = new Date();
    }, false, 'projects/loadDraft'),

  markSaved: () =>
    set(state => {
      state.isDirty = false;
      state.lastSaved = new Date();
    }, false, 'projects/markSaved'),
});

/**
 * 状态池创建函数 - 使用持久化存储
 */
export const projectDraftStore = createPersistStore<ProjectDraftState, ProjectDraftState>(
  projectDraftCreator,
  {
    name: 'project-draft',
    // 只持久化草稿数据，不持久化状态标志
    partialize: (state) => ({ 
      draft: state.draft,
      isDirty: false,
      lastSaved: null,
      setDraft: state.setDraft,
      updateField: state.updateField,
      clearDraft: state.clearDraft,
      loadDraft: state.loadDraft,
      markSaved: state.markSaved,
    }),
    // 合并策略：只恢复草稿数据
    merge: (persistedState, currentState) => ({
      ...currentState,
      draft: { ...initDraft, ...(persistedState as ProjectDraftState)?.draft },
      isDirty: false,
      lastSaved: null,
    }),
  },
  { 
    name: 'project-draft-store' 
  }
);

/**
 * 创建store的钩子函数
 */
export function useProjectDraftStore<T>(selector: (state: ProjectDraftState) => T): T {
  return useStore(projectDraftStore, useShallow<ProjectDraftState, T>(selector));
}

