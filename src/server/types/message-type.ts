import { z } from "zod";
import {
  messageSchema,
  messageListSchema,
  createMessageSchema,
} from "@/server/schema/message-schema";

// 消息类型
export type MessageType = z.infer<typeof messageSchema>;

// 消息列表类型
export type MessageList = z.infer<typeof messageListSchema>;

// 创建消息类型
export type CreateMessageType = z.infer<typeof createMessageSchema>;
