'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/shadcn/ui/avatar';
import { useForm } from '@tanstack/react-form';
import { bioUpdateSchema } from '@/server/schema/profile-schema';
import { useBioOperations, validateAvatarFile } from '@/client/profile/bio-api';
import { Upload, User } from 'lucide-react';
import { ProfileType } from '@/server/types/profile-type';
import styles from './bio-form.module.css';
import {toast} from "sonner";

interface BioFormProps {
  initialData?: ProfileType;
  onSuccess?: (data: ProfileType) => void;
  onCancel?: () => void;
}

export function BioForm({ initialData, onSuccess, onCancel }: BioFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateBio } = useBioOperations();

  const form = useForm({
    defaultValues: {
      name: initialData?.name || '',
      title: initialData?.title || '',
      email: initialData?.email || '',
      bio: initialData?.bio || '',
      avatar: initialData?.avatar,
      avatarMimeType: initialData?.avatarMimeType,
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 手动验证数据
        const validatedData = bioUpdateSchema.parse({
          ...values.value,
          avatar: values.value.avatar || undefined,
          avatarMimeType: values.value.avatarMimeType || undefined,
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

  // 处理头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      toast.error(validation.message, { position: 'top-center' });
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      
      // 更新表单数据
      form.setFieldValue('avatar', result);
      form.setFieldValue('avatarMimeType', file.type);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
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
      {/* 头像上传区域 */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <Avatar className={styles.avatar} onClick={triggerFileUpload}>
            <AvatarImage src={avatarPreview || undefined} alt="头像预览" />
            <AvatarFallback className={styles.avatarFallback}>
              <User className="size-8" />
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className={styles.uploadButton}
            onClick={triggerFileUpload}
            disabled={isSubmitting}
          >
            <Upload className="size-4" />
          </Button>
        </div>
        <div className={styles.avatarInfo}>
          <p className={styles.avatarTitle}>
            点击上传头像
          </p>
          <p className={styles.avatarSubtitle}>
            支持 JPEG、PNG、WebP 格式，大小不超过 2MB
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleAvatarUpload}
          className={styles.fileInput}
        />
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
