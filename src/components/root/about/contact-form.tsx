"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import {
  Field,
  FieldError,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { createMessageSchema } from "@/server/schema/message-schema";
import { useMessageAPI } from "@/client/message-api";
import { useMessageRateLimitStore } from "@/store/message/store";
import { TRPCReactProvider } from "@/components/trpc/client";

const styles = {
  container: 'group relative bg-stone-50/80 dark:bg-card rounded-lg border border-stone-200 dark:border-border p-6 md:p-8 overflow-hidden',
  borderBeam: 'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
  form: 'space-y-6',
  formRow: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  field: 'flex-1',
  rateLimitAlert: 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4',
  rateLimitContent: 'flex items-center gap-2 text-yellow-800 dark:text-yellow-200',
  rateLimitIcon: 'text-lg',
  rateLimitText: 'text-sm font-medium font-sans',
  submitContainer: 'flex justify-center',
  submitButton: 'min-w-[140px]',
  submittingContent: 'flex items-center gap-2',
  spinner: 'w-4 h-4',
};

function ContactFormContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { useCreateMessage } = useMessageAPI();
  const createMessageMutation = useCreateMessage();
  
  // 从 zustand store 获取限流状态
  const checkCanSend = useMessageRateLimitStore(state => state.checkCanSend);
  const recordSent = useMessageRateLimitStore(state => state.recordSent);
  const getRemainingTime = useMessageRateLimitStore(state => state.getRemainingTime);
  
  // 定期检查限流状态
  const [remainingTime, setRemainingTime] = useState(0);
  useEffect(() => {
    const updateRemainingTime = () => {
      if (!checkCanSend()) {
        setRemainingTime(getRemainingTime());
      } else {
        setRemainingTime(0);
      }
    };
    
    updateRemainingTime();
    const timer = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(timer);
  }, [checkCanSend, getRemainingTime]);

  const form = useForm({
    defaultValues: { 
      name: '', 
      email: '', 
      content: '' 
    },
    validators: {
      onSubmit: createMessageSchema
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 前端限流检查
        if (!checkCanSend()) {
          const remaining = getRemainingTime();
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          const timeMsg = minutes > 0 
            ? `${minutes}分${seconds}秒` 
            : `${seconds}秒`;
          
          toast.error('发送太频繁', {
            description: `请在 ${timeMsg} 后再试`,
            position: 'top-center',
          });
          return;
        }
        
        // 获取 User Agent
        const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : undefined;
        
        const messageData = {
          name: values.value.name,
          email: values.value.email,
          content: values.value.content,
          userAgent: userAgent,
        };

        await createMessageMutation.mutateAsync(messageData);
        
        toast.success('发送成功！我们已收到您的留言。');

        // 记录发送时间（前端限流）
        recordSent();
        setRemainingTime(getRemainingTime());
        
        // 重置表单
        form.reset();
      } catch (error: any) {
        console.error('创建消息错误:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 渲染姓名字段
  const renderNameField = () => (
    <form.Field
      name="name"
      validators={{
        onChange: ({ value }) => {
          if (!value || value.length < 2) {
            return { message: '姓名至少需要2个字符' };
          }
          return undefined;
        }
      }}
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid} className={styles.field}>
            <Input
              type="text"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="姓名*"
              autoComplete="name"
              required
            />
            {isInvalid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </Field>
        );
      }}
    />
  );

  // 渲染邮箱字段
  const renderEmailField = () => (
    <form.Field
      name="email"
      validators={{
        onChange: ({ value }) => {
          if (!value) {
            return { message: '邮箱不能为空' };
          }
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            return { message: '请输入有效的邮箱地址' };
          }
          return undefined;
        }
      }}
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid} className={styles.field}>
            <Input
              type="email"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="邮箱*"
              autoComplete="email"
              required
            />
            {isInvalid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </Field>
        );
      }}
    />
  );

  // 渲染消息内容字段
  const renderContentField = () => (
    <form.Field
      name="content"
      validators={{
        onChange: ({ value }) => {
          if (!value || value.length < 10) {
            return { message: '留言内容至少需要10个字符' };
          }
          return undefined;
        }
      }}
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <Textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="留言*"
              rows={12}
              required
            />
            {isInvalid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </Field>
        );
      }}
    />
  );

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    }
    return `${secs}秒`;
  };
  
  // 格式化提示信息
  const formatMessage = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    const totalMinutes = minutes + (remainingSecs > 0 ? 1 : 0); // 向上取整到分钟
    
    if (totalMinutes === 0) {
      return `你已发送，大约${remainingSecs}秒后可以收到，${totalMinutes}分钟内不能再次发送`;
    }
    return `你已发送，大约${totalMinutes}分钟后可以收到，${totalMinutes}分钟内不能再次发送`;
  };

  return (
    <div className={styles.container}>
      <BorderBeam 
        size={200}
        duration={8}
        delay={0}
        colorFrom="#a855f7"
        colorTo="#ec4899"
        borderWidth={1}
        className={styles.borderBeam}
      />
      <form
        onSubmit={handleSubmit}
        className={styles.form}
        aria-busy={isSubmitting}
        noValidate
      >
        {/* 姓名和邮箱在同一行 */}
        <div className={styles.formRow}>
          {renderNameField()}
          {renderEmailField()}
        </div>

        {/* 消息内容 */}
        {renderContentField()}

        {/* 限流提示 */}
        {remainingTime > 0 && (
          <div className={styles.rateLimitAlert}>
            <div className={styles.rateLimitContent}>
              <span className={styles.rateLimitIcon}>⏱️</span>
              <span className={styles.rateLimitText}>
                {formatMessage(remainingTime)}
              </span>
            </div>
          </div>
        )}

        {/* 提交按钮 */}
        <div className={styles.submitContainer}>
          <Button
            type="submit"
            disabled={isSubmitting || remainingTime > 0}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <span className={styles.submittingContent}>
                <Spinner className={styles.spinner} aria-hidden="true" />
                <span>发送中...</span>
              </span>
            ) : (
              '发送消息'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ContactForm() {
  return (
    <TRPCReactProvider>
      <ContactFormContent />
    </TRPCReactProvider>
  );
}

