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
import { useTagOperations, validateTagName } from "@/client/blog/tag-api";
import { TagType } from "@/server/types/blog-type";
import styles from './tag-edit-form.module.css';

interface TagEditFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    mode?: 'create' | 'edit';
    tag?: TagType;
}

export function TagEditForm({ onSuccess, onCancel, mode = 'create', tag }: TagEditFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { createTag, updateTag } = useTagOperations();
    
    const isEditMode = mode === 'edit';

    const form = useForm({
        defaultValues: isEditMode 
            ? { 
                id: tag?.id || '',
                name: tag?.name || '' 
              }
            : { 
                name: '' 
              },
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                
                if (isEditMode) {
                    // 编辑模式
                    const updateData = {
                        name: values.value.name,
                    };

                    if (!(values.value as any).id) {
                        throw new Error('标签ID不存在');
                    }
                    
                    await updateTag((values.value as any).id, updateData);
                } else {
                    // 创建模式
                    const tagData = {
                        name: values.value.name,
                    };

                    await createTag(tagData);
                }
                
                // 重置表单
                form.reset();
                
                // 调用成功回调
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error: any) {
                // 错误处理已经在 API 层完成，这里只需要处理组件状态
                console.error(isEditMode ? '更新标签错误:' : '创建标签错误:', error);
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    // 渲染标签名称字段
    const renderNameField = () => (
        <form.Field
            name="name"
            validators={{
                onChange: ({ value }) => {
                    const validation = validateTagName(value);
                    if (!validation.valid) {
                        return { message: validation.message };
                    }
                    return undefined;
                }
            }}
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                    <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>标签名称</FieldLabel>
                        <Input
                            type="text"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="请输入标签名称"
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
        console.log('表单提交被触发，模式:', mode, '标签:', tag);
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
                            isEditMode ? '更新标签' : '创建标签'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}