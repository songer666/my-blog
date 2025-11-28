import { createTRPCRouter, protectedProcedure, baseProcedure } from "@/server/init";
import { messageListSchema, createMessageSchema } from "@/server/schema/message-schema";
import { 
  getMessageList, 
  createMessage, 
  deleteMessage, 
  toggleMessageRead,
  checkRateLimit,
  recordMessageSent
} from "@/server/actions/message-action";
import { isNil } from "lodash";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { formatIpAddress } from "@/lib/ip-utils";

const isrUrl = '/admin/dashboard/message';

export const messageRoute = createTRPCRouter({
  // 获取所有消息（管理员）
  all: protectedProcedure
    .output(messageListSchema)
    .query(async () => {
      try {
        const messages = await getMessageList();
        if (isNil(messages) || messages.length === 0)
          return [];
        return messages;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 获取未读消息数量（管理员）
  unreadCount: protectedProcedure
    .output(z.number())
    .query(async () => {
      try {
        const messages = await getMessageList();
        if (isNil(messages)) return 0;
        return messages.filter(m => !m.isRead).length;
      } catch (e: any) {
        return 0;
      }
    }),

  // 创建消息（公开接口）
  create: baseProcedure
    .input(createMessageSchema)
    .mutation(async (opts) => {
      try {
        const { name, email, content, userAgent } = opts.input;
        
        // 从请求头获取 IP 地址
        const headersList = await headers();
        const rawIpAddress = 
          headersList.get('x-forwarded-for')?.split(',')[0] || 
          headersList.get('x-real-ip') || 
          headersList.get('cf-connecting-ip') || 
          'unknown';
        
        // 格式化 IP 地址（处理 IPv6）
        const ipAddress = formatIpAddress(rawIpAddress);
        
        // 检查发送频率限制（30分钟内只能发送一次）
        const rateLimitCheck = await checkRateLimit(ipAddress, userAgent);
        if (!rateLimitCheck.canSend) {
          const minutes = Math.floor(rateLimitCheck.remainingSeconds / 60);
          const seconds = rateLimitCheck.remainingSeconds % 60;
          const timeMsg = minutes > 0 
            ? `${minutes}分${seconds}秒` 
            : `${seconds}秒`;
          throw new TRPCError({ 
            code: 'TOO_MANY_REQUESTS', 
            message: `发送太频繁，请在 ${timeMsg} 后再试` 
          });
        }
        
        const newMessage = await createMessage(name, email, content, ipAddress, userAgent);
        
        if (isNil(newMessage))
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: '消息创建失败' });
        
        // 记录发送时间
        await recordMessageSent(ipAddress, userAgent);
        
        revalidatePath(isrUrl);
        return { success: true, data: newMessage };
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message || '创建失败' });
      }
    }),

  // 删除消息（管理员）
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async (opts) => {
      try {
        const res = await deleteMessage(opts.input.id);
        if (!res.deleted) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '消息不存在' });
        }
        revalidatePath(isrUrl);
        return res;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // 切换已读状态（管理员）
  toggleRead: protectedProcedure
    .input(z.object({ id: z.string(), isRead: z.boolean() }))
    .mutation(async (opts) => {
      try {
        const res = await toggleMessageRead(opts.input.id, opts.input.isRead);
        if (isNil(res))
          throw new TRPCError({ code: 'NOT_FOUND', message: '消息不存在' });
        revalidatePath(isrUrl);
        return res;
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),
});
