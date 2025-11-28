'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { friendUpdateSchema } from '@/server/schema/profile-schema';
import { useFriendAPI, validateFriendAvatarFile, validateFriendUrl, extractNameFromUrl } from '@/client/profile/friend-api';
import { toast } from 'sonner';
import { Upload, Users, ExternalLink } from 'lucide-react';
import { FriendType } from '@/server/types/profile-type';
import styles from './friend-form.module.css';

interface FriendFormProps {
  onSuccess?: (data: FriendType) => void;
  onCancel?: () => void;
}

export function FriendForm({ onSuccess, onCancel }: FriendFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { useCreateFriend } = useFriendAPI();
  const createFriendMutation = useCreateFriend();

  const form = useForm({
    defaultValues: {
      name: '',
      title: '',
      url: '',
      avatar: undefined as string | undefined,
      avatarMimeType: undefined as string | undefined,
      sortOrder: 0,
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 手动验证数据
        const validatedData = friendUpdateSchema.parse({
          ...values.value,
          avatar: values.value.avatar || undefined,
          avatarMimeType: values.value.avatarMimeType || undefined,
        });
        
        const result = await createFriendMutation.mutateAsync(validatedData);
        
        if (result.success && result.data) {
          toast.success(result.message || '友链添加成功', { 
            position: 'top-center' 
          });
          onSuccess?.(result.data);
        } else {
          toast.error(result.message || '添加失败', { 
            position: 'top-center' 
          });
        }
      } catch (error: any) {
        console.error('添加友链失败:', error);
        toast.error('添加过程中发生错误', { 
          position: 'top-center' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 处理友链头像上传
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateFriendAvatarFile(file);
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

  // 处理 URL 变化，自动提取名称
  const handleUrlChange = (url: string) => {
    form.setFieldValue('url', url);
    
    // 如果名称为空，尝试从 URL 提取
    if (!form.getFieldValue('name') && url) {
      const extractedName = extractNameFromUrl(url);
      if (extractedName) {
        form.setFieldValue('name', extractedName);
      }
    }
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <div className={styles.container}>
      {/* 友链头像上传区域 */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <div className={styles.avatarPreview} onClick={triggerFileUpload}>
            {avatarPreview ? (
              <img src={avatarPreview} alt="友链头像预览" className={styles.avatarImage} />
            ) : (
              <Users className={styles.avatarPlaceholder} />
            )}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={triggerFileUpload}
            disabled={isSubmitting}
            className={styles.uploadButton}
          >
            <Upload className="size-4 mr-2" />
            上传头像
          </Button>
        </div>
        <div className={styles.avatarInfo}>
          <p className={styles.avatarTitle}>友链头像（可选）</p>
          <p className={styles.avatarSubtitle}>支持 JPEG、PNG、WebP 格式，大小不超过 1MB</p>
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
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FieldGroup className={styles.fieldGroup}>
          {/* 友链地址 */}
          <form.Field
            name="url"
            validators={{
              onChange: ({ value }) => {
                if (!value) return '友链地址不能为空';
                
                const validation = validateFriendUrl(value);
                if (!validation.valid) {
                  return validation.message;
                }
                
                return undefined;
              },
            }}
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>友链地址 *</FieldLabel>
                  <div className={styles.urlInputWrapper}>
                    <ExternalLink className={styles.urlIcon} />
                    <Input
                      type="url"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isSubmitting}
                      onBlur={field.handleBlur}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="https://example.com"
                      className={styles.urlInput}
                      required
                    />
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
                </Field>
              );
            }}
          />

          {/* 友链名称 */}
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                if (!value) return '友链名称不能为空';
                return undefined;
              },
            }}
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>友链名称 *</FieldLabel>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="请输入友链名称"
                    maxLength={50}
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
                </Field>
              );
            }}
          />

          {/* 友链标题 */}
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) => {
                if (!value) return '友链标题不能为空';
                return undefined;
              },
            }}
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>友链标题 *</FieldLabel>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="请输入友链标题或描述"
                    maxLength={100}
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
                </Field>
              );
            }}
          />

          {/* 排序权重 */}
          <form.Field
            name="sortOrder"
            children={(field) => {
              return (
                <Field>
                  <FieldLabel htmlFor={field.name}>排序权重</FieldLabel>
                  <Input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min={0}
                    max={999}
                  />
                  <p className={styles.fieldHint}>
                    数值越小排序越靠前，默认为 0
                  </p>
                </Field>
              );
            }}
          />
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
                <span>添加中...</span>
              </div>
            ) : (
              '添加友链'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
