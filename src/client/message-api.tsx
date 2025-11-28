"use client";

import { useTRPC } from "@/components/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { CreateMessageType } from "@/server/types/message-type";

/**
 * 消息 API 封装
 * 包含所有消息相关的后端调用和用户反馈
 */
export function useMessageAPI() {
  const trpc = useTRPC();
  
  return {
    /**
     * 创建消息 - 包含完整的错误处理和用户反馈
     */
    useCreateMessage: () => useMutation({
      ...trpc.message.create.mutationOptions(),
      onSuccess: () => {
        toast.success('留言发送成功', {
          position: 'top-center',
          description: '感谢您的留言，我们会尽快回复'
        });
      },
      onError: (error: any) => {
        console.error('创建消息错误:', error);
        toast.error('留言发送失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 删除消息 - 包含完整的错误处理和用户反馈
     */
    useDeleteMessage: () => useMutation({
      ...trpc.message.delete.mutationOptions(),
      onSuccess: () => {
        toast.success('消息删除成功', {
          position: 'top-center',
          description: '消息已成功删除'
        });
      },
      onError: (error: any) => {
        console.error('删除消息错误:', error);
        toast.error('消息删除失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 切换消息已读状态 - 包含完整的错误处理和用户反馈
     */
    useToggleRead: () => useMutation({
      ...trpc.message.toggleRead.mutationOptions(),
      onSuccess: (data) => {
        const status = data.isRead ? '已读' : '未读';
        toast.success(`消息已标记为${status}`, {
          position: 'top-center',
          description: `消息状态已更新为${status}`
        });
      },
      onError: (error: any) => {
        console.error('切换消息已读状态错误:', error);
        toast.error('操作失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      }
    }),
    
    /**
     * 获取 TRPC 客户端实例
     */
    getTRPC: () => trpc,
  };
}

/**
 * 消息业务逻辑封装
 * 提供高级的消息操作方法
 */
export function useMessageOperations() {
  const { useCreateMessage, useDeleteMessage, useToggleRead } = useMessageAPI();
  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();
  const toggleReadMutation = useToggleRead();

  return {
    /**
     * 创建消息的便捷方法
     */
    createMessage: async (data: CreateMessageType) => {
      return await createMessageMutation.mutateAsync(data);
    },

    /**
     * 删除消息的便捷方法
     */
    deleteMessage: async (id: string) => {
      return await deleteMessageMutation.mutateAsync({ id });
    },

    /**
     * 切换消息已读状态的便捷方法
     */
    toggleRead: async (id: string, isRead: boolean) => {
      return await toggleReadMutation.mutateAsync({ id, isRead });
    },

    /**
     * 获取加载状态
     */
    isLoading: createMessageMutation.isPending || deleteMessageMutation.isPending || 
               toggleReadMutation.isPending,

    /**
     * 重置所有状态
     */
    reset: () => {
      createMessageMutation.reset();
      deleteMessageMutation.reset();
      toggleReadMutation.reset();
    }
  };
}
