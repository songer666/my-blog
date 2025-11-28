import { db } from "@/db";
import { message as messageTable, messageRateLimit } from '@/db/schema/message';
import { eq, and } from "drizzle-orm";
import { isNil } from 'lodash';
import crypto from 'crypto';

/**
 * 获取消息列表
 */
export const getMessageList = async () => {
  const messages = await db.query.message.findMany({
    orderBy: (message, { desc }) => [desc(message.createdAt)]
  });
  return messages;
}

/**
 * 创建消息
 */
export async function createMessage(
  name: string,
  email: string,
  content: string,
  ipAddress?: string,
  userAgent?: string
) {
  const [newMessage] = await db
    .insert(messageTable)
    .values({
      name,
      email,
      content,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      isRead: false,
    })
    .returning();
  
  if (isNil(newMessage)) return null;
  return newMessage;
}

/**
 * 删除消息
 */
export async function deleteMessage(id: string) {
  const [deletedMessage] = await db
    .delete(messageTable)
    .where(eq(messageTable.id, id))
    .returning({ id: messageTable.id });

  return {
    deleted: !isNil(deletedMessage),
    messageId: deletedMessage?.id ?? id,
  };
}

/**
 * 切换消息的已读状态
 */
export async function toggleMessageRead(id: string, isRead: boolean) {
  const [updatedMessage] = await db
    .update(messageTable)
    .set({ isRead })
    .where(eq(messageTable.id, id))
    .returning();
  
  if (isNil(updatedMessage)) return null;
  return updatedMessage;
}

/**
 * 生成 IP+UA 的唯一标识符
 */
function generateRateLimitKey(ipAddress: string, userAgent?: string): string {
  const data = `${ipAddress}:${userAgent || 'unknown'}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * 检查是否在发送限制内（30分钟内不能重复发送）
 * @returns { canSend: boolean, remainingSeconds: number }
 */
export async function checkRateLimit(ipAddress: string, userAgent?: string) {
  const rateLimitKey = generateRateLimitKey(ipAddress, userAgent);
  
  // 查询该 IP+UA 的最后发送记录
  const record = await db.query.messageRateLimit.findFirst({
    where: eq(messageRateLimit.id, rateLimitKey),
  });
  
  if (!record) {
    return { canSend: true, remainingSeconds: 0 };
  }
  
  // 检查是否在30分钟内
  const now = new Date();
  const lastSentAt = new Date(record.lastSentAt);
  const diffMs = now.getTime() - lastSentAt.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  
  if (diffMinutes >= 30) {
    return { canSend: true, remainingSeconds: 0 };
  }
  
  const remainingSeconds = Math.ceil((30 * 60) - (diffMs / 1000));
  return { canSend: false, remainingSeconds };
}

/**
 * 记录消息发送时间（用于限流）
 */
export async function recordMessageSent(ipAddress: string, userAgent?: string) {
  const rateLimitKey = generateRateLimitKey(ipAddress, userAgent);
  
  // 尝试更新记录，如果不存在则插入
  const existing = await db.query.messageRateLimit.findFirst({
    where: eq(messageRateLimit.id, rateLimitKey),
  });
  
  if (existing) {
    await db
      .update(messageRateLimit)
      .set({ 
        lastSentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(messageRateLimit.id, rateLimitKey));
  } else {
    await db
      .insert(messageRateLimit)
      .values({
        id: rateLimitKey,
        ipAddress,
        userAgent: userAgent || null,
        lastSentAt: new Date(),
      });
  }
}
