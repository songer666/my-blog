"use client";

import React, { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import styles from './save-form.module.css';
import {isNil} from "lodash";
import {registerUserSchema, updateUserSchema} from "@/server/schema/user-schema";
import { authApi, useAuthAPI } from "@/client/auth-api";
import {UserType} from "@/server/types/user-type";

interface SaveUserFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    mode?: 'create' | 'edit';
    user?: UserType;
}

interface CreateUserData {
    email: string;
    name: string;
    password: string;
}

export function SaveUserForm({ onSuccess, onCancel, mode = 'create', user }: SaveUserFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { useUpdateUser } = useAuthAPI();
    const updateUserMutation = useUpdateUser();
    
    const isEditMode = mode === 'edit';

    const form = useForm({
        defaultValues: isEditMode 
            ? { 
                id: user?.id || '',
                email: user?.email || '', 
                name: user?.name || '' 
              }
            : { 
                email: '', 
                name: '', 
                password: '' 
              },
        validators: {
          onSubmit: isEditMode ? updateUserSchema : registerUserSchema
        },
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                
                if (isEditMode) {
                    // 编辑模式
                    const updateData = {
                        id: (values.value as any).id,
                        email: values.value.email,
                        name: values.value.name,
                    };

                    if (!updateData.id) {
                        throw new Error('用户ID不存在');
                    }
                    await updateUserMutation.mutateAsync(updateData);
                    
                    toast.success('用户更新成功', { 
                        position: 'top-center',
                        description: `用户 ${updateData.name} 已成功更新`
                    });
                } else {
                    // 创建模式
                    const userData: CreateUserData = {
                        email: values.value.email,
                        name: values.value.name,
                        password: (values.value as any).password,
                    };

                    const {data} = await authApi.signUp(
                        userData.email,
                        userData.name,
                        userData.password
                    );
                    
                    if (!isNil(data?.user)) {
                        toast.success('用户创建成功', { 
                            position: 'top-center',
                            description: `用户 ${userData.name} 已成功创建`
                        });
                    } else {
                        toast.error('用户创建失败', { 
                            position: 'top-center',
                            description: '服务器返回了错误状态'
                        });
                        return;
                    }
                }
                
                // 重置表单
                form.reset();
                
                // 调用成功回调
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error: any) {
                console.error(isEditMode ? '更新用户错误:' : '创建用户错误:', error);
                
                toast.error(isEditMode ? '用户更新失败' : '用户创建失败', {
                    description: error?.message || '网络错误，请稍后重试',
                    position: 'top-center',
                });
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
                            placeholder="请输入用户姓名"
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

    // 渲染密码字段
    const renderPasswordField = () => (
        <form.Field
            name="password"
            validators={{
                onChange: ({ value }) => {
                    // 编辑模式下跳过密码验证
                    if (isEditMode) {
                        return undefined;
                    }
                    if (!value || value.length < 6) {
                        return { message: '密码至少需要6个字符' };
                    }
                    return undefined;
                }
            }}
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                    <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
                        <Input
                            type="password"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting || isEditMode}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder={isEditMode ? "编辑模式下密码不可修改" : "请输入密码（至少6位）"}
                            autoComplete="new-password"
                            required={!isEditMode}
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
        console.log('表单提交被触发，模式:', mode, '用户:', user);
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
                    {isEditMode && (
                        <form.Field name="id">
                            {(field) => (
                                <input
                                    type="hidden"
                                    name={field.name}
                                    value={field.state.value}
                                />
                            )}
                        </form.Field>
                    )}
                    {renderNameField()}
                    {renderEmailField()}
                    {renderPasswordField()}
                </FieldGroup>

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
                        disabled={isSubmitting}
                        className={styles.submitButton}
                    >
                        {isSubmitting ? (
                            <span className={styles.loadingContent}>
                                <Spinner className={styles.spinner} aria-hidden="true" />
                                <span>{isEditMode ? '更新中...' : '创建中...'}</span>
                            </span>
                        ) : (
                            isEditMode ? '更新用户' : '创建用户'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}