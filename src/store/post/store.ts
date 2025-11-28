import { createPersistStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { PostDraft, PostDraftState, PersistMiddlewares } from "@/store/post/type";
import { useShallow } from "zustand/react/shallow";

// 初始化草稿数据
const initDraft: PostDraft = {
  title: '',
  description: '',
  slug: '',
  content: '',
  image: '',
  keyWords: '',
  tagIds: [],
};

/**
 * 初始化状态
 */
const postDraftCreator: StateCreator<PostDraftState, PersistMiddlewares, [], PostDraftState> = (set) => ({
  draft: initDraft,
  isDirty: false,
  lastSaved: null,

  setDraft: (newDraft: Partial<PostDraft>) =>
    set(state => {
      state.draft = { ...state.draft, ...newDraft };
      state.isDirty = true;
    }, false, 'post/setDraft'),

  updateField: <K extends keyof PostDraft>(field: K, value: PostDraft[K]) =>
    set(state => {
      state.draft[field] = value;
      state.isDirty = true;
    }, false, 'post/updateField'),

  addTag: (tagId: string) =>
    set(state => {
      if (!state.draft.tagIds.includes(tagId)) {
        state.draft.tagIds.push(tagId);
        state.isDirty = true;
      }
    }, false, 'post/addTag'),

  removeTag: (tagId: string) =>
    set(state => {
      const index = state.draft.tagIds.indexOf(tagId);
      if (index > -1) {
        state.draft.tagIds.splice(index, 1);
        state.isDirty = true;
      }
    }, false, 'post/removeTag'),

  toggleTag: (tagId: string) =>
    set(state => {
      const index = state.draft.tagIds.indexOf(tagId);
      if (index > -1) {
        state.draft.tagIds.splice(index, 1);
      } else {
        state.draft.tagIds.push(tagId);
      }
      state.isDirty = true;
    }, false, 'post/toggleTag'),

  clearDraft: () =>
    set(state => {
      state.draft = { ...initDraft };
      state.isDirty = false;
      state.lastSaved = null;
    }, false, 'post/clearDraft'),

  loadDraft: (draft: PostDraft) =>
    set(state => {
      state.draft = { ...draft };
      state.isDirty = false;
      state.lastSaved = new Date();
    }, false, 'post/loadDraft'),

  markSaved: () =>
    set(state => {
      state.isDirty = false;
      state.lastSaved = new Date();
    }, false, 'post/markSaved'),
});

/**
 * 状态池创建函数 - 使用持久化存储
 */
export const postDraftStore = createPersistStore<PostDraftState, PostDraftState>(
  postDraftCreator,
  {
    name: 'blog-post-draft',
    // 只持久化草稿数据，不持久化状态标志
    partialize: (state) => ({ 
      draft: state.draft,
      isDirty: false,
      lastSaved: null,
      setDraft: state.setDraft,
      updateField: state.updateField,
      addTag: state.addTag,
      removeTag: state.removeTag,
      toggleTag: state.toggleTag,
      clearDraft: state.clearDraft,
      loadDraft: state.loadDraft,
      markSaved: state.markSaved,
    }),
    // 合并策略：只恢复草稿数据
    merge: (persistedState, currentState) => ({
      ...currentState,
      draft: { ...initDraft, ...(persistedState as PostDraftState)?.draft },
      isDirty: false,
      lastSaved: null,
    }),
  },
  { 
    name: 'post-draft-store' 
  }
);

/**
 * 创建store的钩子函数
 */
export function usePostDraftStore<T>(selector: (state: PostDraftState) => T): T {
  return useStore(postDraftStore, useShallow<PostDraftState, T>(selector));
}
