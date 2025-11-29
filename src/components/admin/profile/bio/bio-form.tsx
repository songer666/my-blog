'use client';

import React, { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/ui/avatar';
import { useForm } from '@tanstack/react-form';
import { bioUpdateSchema } from '@/server/schema/profile-schema';
import { useBioOperations } from '@/client/profile/bio-api';
import { User } from 'lucide-react';
import { ProfileType } from '@/server/types/profile-type';
import styles from './bio-form.module.css';

interface BioFormProps {
  initialData?: ProfileType;
  onSuccess?: (data: ProfileType) => void;
  onCancel?: () => void;
}

export function BioForm({ initialData, onSuccess, onCancel }: BioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData?.avatar || '');
  const [error, setError] = useState<string>('');
  const { updateBio } = useBioOperations();

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || '',
      email: initialData?.email || '',
      bio: initialData?.bio || '',
      avatar: initialData?.avatar || '',
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 手动验证数据
        const validatedData = bioUpdateSchema.parse({
          ...values.value,
          avatar: values.value.avatar || undefined,
        });
        
        const result = await updateBio(validatedData);
        
        if (result.success && result.data) {
          onSuccess?.(result.data);
        }
      } catch (error: any) {
        // 错误处理已经在 API 层完成
        console.error('更新个人资料失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 验证图片路径（支持URL和相对路径）
  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // 空值允许
    
    // 如果是相对路径（以/开头），直接通过
    if (url.startsWith('/')) {
      setError('');
      return true;
    }
    
    // 如果是URL，验证格式
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setError('请输入有效的HTTP或HTTPS图片链接，或以/开头的相对路径');
        return false;
      }
      setError('');
      return true;
    } catch {
      setError('请输入有效的图片URL或相对路径（如 /images/avatar.jpg）');
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    setAvatarUrl(url);
    form.setFieldValue('avatar', url);
    if (url.trim()) {
      validateImageUrl(url);
    } else {
      setError('');
    }
  };

  // 渲染姓名字段
  const renderNameField = () => (
    <form.Field
      name="name"
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>姓名 *</FieldLabel>
            <Input
              type="text"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="请输入您的姓名"
              maxLength={50}
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

  // 渲染职位字段
  const renderTitleField = () => (
    <form.Field
      name="title"
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>职位/简介 *</FieldLabel>
            <Input
              type="text"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="请输入您的职位或简短介绍"
              maxLength={100}
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
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>邮箱 *</FieldLabel>
            <Input
              type="email"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="请输入您的邮箱地址"
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

  // 渲染个人简介字段
  const renderBioField = () => (
    <form.Field
      name="bio"
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>个人简介 *</FieldLabel>
            <textarea
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="请输入您的个人简介..."
              maxLength={1000}
              rows={4}
              className={styles.textarea}
              required
            />
            <div className={styles.textareaFooter}>
              <div>
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </div>
              <span className={styles.charCount}>
                {field.state.value.length}/1000
              </span>
            </div>
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
      {/* 头像URL输入区域 */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <Avatar className={styles.avatar}>
            <AvatarImage src={avatarUrl || undefined} alt="头像预览" />
            <AvatarFallback className={styles.avatarFallback}>
              <User className="size-8" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className={styles.avatarInfo}>
          <div className="space-y-2 w-full">
            <label htmlFor="avatarUrl" className={styles.avatarTitle}>
              头像URL
            </label>
            <Input
              type="url"
              id="avatarUrl"
              value={avatarUrl}
              disabled={isSubmitting}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="w-full"
            />
            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}
            <p className={styles.avatarSubtitle}>
              支持完整URL（https://...）或相对路径（/images/avatar.jpg）
            </p>
          </div>
        </div>
      </div>

      {/* 表单区域 */}
      <form
        onSubmit={handleSubmit}
        className={styles.form}
        noValidate
      >
        <FieldGroup className={styles.fieldGroup}>
          {renderNameField()}
          {renderTitleField()}
          {renderEmailField()}
          {renderBioField()}
        </FieldGroup>

        {/* 操作按钮 */}
        <div className={styles.actions}>
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
              <div className={styles.loadingContent}>
                <Spinner className={styles.spinner} />
                <span>保存中...</span>
              </div>
            ) : (
              '保存'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
