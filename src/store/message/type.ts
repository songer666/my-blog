/**
 * 消息发送限制数据类型
 */
export type MessageRateLimit = {
  lastSentTime: number | null; // 最后发送时间戳
  canSend: boolean; // 是否可以发送
}

/**
 * 消息发送限制动作
 */
export type MessageRateLimitAction = {
  recordSent: () => void; // 记录已发送
  checkCanSend: () => boolean; // 检查是否可以发送
  getRemainingTime: () => number; // 获取剩余等待时间（秒）
  reset: () => void; // 重置状态
}

/**
 * 消息发送限制整体状态类型
 */
export type MessageRateLimitState = MessageRateLimit & MessageRateLimitAction

/**
 * zustand持久化中间件类型
 */
export type PersistMiddlewares =
  [
    ['zustand/subscribeWithSelector', never],
    ['zustand/immer', never],
    ['zustand/devtools', never],
    ['zustand/persist', MessageRateLimitState],
  ];
