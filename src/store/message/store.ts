import { createPersistStore } from "@/lib/store";
import { StateCreator, useStore } from "zustand";
import { MessageRateLimitState, PersistMiddlewares } from "@/store/message/type";
import { useShallow } from "zustand/react/shallow";

// 30分钟的毫秒数
const RATE_LIMIT_DURATION = 30 * 60 * 1000;

/**
 * 初始化状态
 */
const messageRateLimitCreator: StateCreator<MessageRateLimitState, PersistMiddlewares, [], MessageRateLimitState> = (set, get) => ({
  lastSentTime: null,
  canSend: true,

  recordSent: () =>
    set(state => {
      const now = Date.now();
      state.lastSentTime = now;
      state.canSend = false;
      
      // 30分钟后自动清除限制
      setTimeout(() => {
        const currentState = get();
        if (currentState.lastSentTime === now) {
          set({ canSend: true }, false, 'message/autoReset');
        }
      }, RATE_LIMIT_DURATION);
    }, false, 'message/recordSent'),

  checkCanSend: () => {
    const state = get();
    if (!state.lastSentTime) return true;
    
    const now = Date.now();
    const elapsed = now - state.lastSentTime;
    const canSend = elapsed >= RATE_LIMIT_DURATION;
    
    // 如果已经超过10分钟，更新状态
    if (canSend && !state.canSend) {
      set({ canSend: true }, false, 'message/checkCanSend');
    }
    
    return canSend;
  },

  getRemainingTime: () => {
    const state = get();
    if (!state.lastSentTime) return 0;
    
    const now = Date.now();
    const elapsed = now - state.lastSentTime;
    const remaining = RATE_LIMIT_DURATION - elapsed;
    
    return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
  },

  reset: () =>
    set({
      lastSentTime: null,
      canSend: true,
    }, false, 'message/reset'),
});

/**
 * 状态池创建函数 - 使用持久化存储
 */
export const messageRateLimitStore = createPersistStore<MessageRateLimitState, MessageRateLimitState>(
  messageRateLimitCreator,
  {
    name: 'blog-message-rate-limit',
    // 持久化最后发送时间
    partialize: (state) => ({ 
      lastSentTime: state.lastSentTime,
      canSend: state.canSend,
      recordSent: state.recordSent,
      checkCanSend: state.checkCanSend,
      getRemainingTime: state.getRemainingTime,
      reset: state.reset,
    }),
    // 合并策略：恢复时检查是否已过期
    merge: (persistedState, currentState) => {
      const persisted = persistedState as MessageRateLimitState;
      const now = Date.now();
      const lastSentTime = persisted?.lastSentTime || null;
      
      // 检查是否已超过30分钟
      let canSend = true;
      if (lastSentTime) {
        const elapsed = now - lastSentTime;
        canSend = elapsed >= RATE_LIMIT_DURATION;
      }
      
      return {
        ...currentState,
        lastSentTime: canSend ? null : lastSentTime,
        canSend,
      };
    },
  },
  { 
    name: 'message-rate-limit-store' 
  }
);

/**
 * 创建store的钩子函数
 */
export function useMessageRateLimitStore<T>(selector: (state: MessageRateLimitState) => T): T {
  return useStore(messageRateLimitStore, useShallow<MessageRateLimitState, T>(selector));
}
