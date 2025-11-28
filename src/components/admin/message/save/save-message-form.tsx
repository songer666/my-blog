"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import styles from './save-message-form.module.css';
import { createMessageSchema } from "@/server/schema/message-schema";
import { useMessageAPI } from "@/client/message-api";
import { useMessageRateLimitStore } from "@/store/message/store";

interface SaveMessageFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function SaveMessageForm({ onSuccess, onCancel }: SaveMessageFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { useCreateMessage } = useMessageAPI();
    const createMessageMutation = useCreateMessage();
    
    // 从 zustand store 获取限流状态
    const checkCanSend = useMessageRateLimitStore(state => state.checkCanSend);
    const recordSent = useMessageRateLimitStore(state => state.recordSent);
    const getRemainingTime = useMessageRateLimitStore(state => state.getRemainingTime);
    const canSend = useMessageRateLimitStore(state => state.canSend);
    
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
                
                // 记录发送时间（前端限流）
                recordSent();
                setRemainingTime(getRemainingTime());
                
                // 重置表单
                form.reset();
                
                // 调用成功回调
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error: any) {
                // toast 已在 message-api.tsx 中统一管理
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
                    <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>姓名</FieldLabel>
                        <Input
                            type="text"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="请输入姓名"
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
                    <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>邮箱</FieldLabel>
                        <Input
                            type="email"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="请输入邮箱地址"
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
                        <FieldLabel htmlFor={field.name}>留言内容</FieldLabel>
                        <Textarea
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="请输入留言内容（至少10个字符）"
                            rows={4}
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

    return (
        <div className={styles.container}>
            <form
                onSubmit={handleSubmit}
                className={styles.form}
                aria-busy={isSubmitting}
                noValidate
            >
                <FieldGroup className={styles.fieldGroup}>
                    {renderNameField()}
                    {renderEmailField()}
                    {renderContentField()}
                </FieldGroup>

                {/* 限流提示 */}
                {remainingTime > 0 && (
                    <div className={styles.rateLimitWarning}>
                        ⏱️ 发送太频繁，请在 {Math.floor(remainingTime / 60)}分{remainingTime % 60}秒 后再试
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className={styles.cancelButton}
                    >
                        取消
                    </Button>
                    
                    <Button
                        type="submit"
                        disabled={isSubmitting || remainingTime > 0}
                        className={styles.submitButton}
                    >
                        {isSubmitting ? (
                            <span className={styles.loadingContent}>
                                <Spinner className={styles.spinner} aria-hidden="true" />
                                <span>创建中...</span>
                            </span>
                        ) : (
                            '创建消息'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
