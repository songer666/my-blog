'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { socialLinkUpdateSchema } from '@/server/schema/profile-schema';
import { useLinkAPI, SOCIAL_PLATFORMS, getPlatformConfig, validateSocialLinkUrl } from '@/client/profile/link-api';
import { toast } from 'sonner';
import { Link, ExternalLink } from 'lucide-react';
import { SocialLinkType } from '@/server/types/profile-type';
import { PlatformIcon } from './platform-icon';
import styles from './link-form.module.css';

interface LinkFormProps {
  mode?: 'create' | 'update';
  initialData?: SocialLinkType;
  onSuccess?: (data: SocialLinkType) => void;
  onCancel?: () => void;
}

export function LinkForm({ mode = 'create', initialData, onSuccess, onCancel }: LinkFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const { useCreateSocialLink, useUpdateSocialLink } = useLinkAPI();
  const createSocialLinkMutation = useCreateSocialLink();
  const updateSocialLinkMutation = useUpdateSocialLink();

  const form = useForm({
    defaultValues: {
      platform: initialData?.platform || '',
      url: (() => {
        // 如果是邮箱且有 mailto: 前缀，去掉前缀显示纯邮箱地址
        if (initialData?.platform === '邮箱' && initialData?.url?.startsWith('mailto:')) {
          return initialData.url.replace('mailto:', '');
        }
        return initialData?.url || '';
      })(),
      icon: initialData?.icon || '',
      sortOrder: initialData?.sortOrder || 0,
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 处理邮箱格式：如果是邮箱平台且没有 mailto: 前缀，自动添加
        let processedUrl = values.value.url;
        if (selectedPlatform === '邮箱' && !processedUrl.startsWith('mailto:')) {
          processedUrl = `mailto:${processedUrl}`;
        }
        
        // 手动验证数据
        const validatedData = socialLinkUpdateSchema.parse({
          ...values.value,
          url: processedUrl,
        });
        
        let result;
        if (mode === 'create') {
          result = await createSocialLinkMutation.mutateAsync(validatedData);
        } else if (initialData?.id) {
          result = await updateSocialLinkMutation.mutateAsync({
            id: initialData.id,
            data: validatedData,
          });
        }
        
        if (result?.success && result.data) {
          toast.success(result.message || `社交链接${mode === 'create' ? '添加' : '更新'}成功`, { 
            position: 'top-center' 
          });
          onSuccess?.(result.data);
        } else {
          toast.error(result?.message || `${mode === 'create' ? '添加' : '更新'}失败`, { 
            position: 'top-center' 
          });
        }
      } catch (error: any) {
        toast.error(`${mode === 'create' ? '添加' : '更新'}过程中发生错误`, { 
          position: 'top-center' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 当选择平台时，自动设置图标和 URL 占位符
  const handlePlatformChange = (platform: string) => {
    setSelectedPlatform(platform);
    const platformConfig = getPlatformConfig(platform);
    if (platformConfig) {
      form.setFieldValue('platform', platform);
      form.setFieldValue('icon', platformConfig.icon);
      
      // 如果是新增模式且 URL 为空，清空 URL 让用户重新输入
      if (mode === 'create' && !form.getFieldValue('url')) {
        form.setFieldValue('url', '');
      }
    }
  };

  // URL 变化时验证格式
  const handleUrlChange = (url: string) => {
    form.setFieldValue('url', url);
    
    if (url && selectedPlatform) {
      const validation = validateSocialLinkUrl(url, selectedPlatform);
      if (!validation.valid) {
        // 这里可以设置字段错误，但由于使用了 tanstack-form，在验证时处理
      }
    }
  };

  // 初始化时设置选中的平台
  useEffect(() => {
    if (initialData?.platform) {
      setSelectedPlatform(initialData.platform);
    }
  }, [initialData]);

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  const currentPlatformConfig = getPlatformConfig(selectedPlatform);

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FieldGroup className={styles.fieldGroup}>
          {/* 平台选择 */}
          <Field>
            <FieldLabel>社交平台 *</FieldLabel>
            <Select
              value={selectedPlatform}
              onValueChange={handlePlatformChange}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择社交平台">
                  {selectedPlatform && (
                    <div className="flex items-center gap-2">
                      <PlatformIcon 
                        iconName={getPlatformConfig(selectedPlatform)?.icon as any}
                        iconSrc={getPlatformConfig(selectedPlatform)?.iconSrc}
                        iconType={getPlatformConfig(selectedPlatform)?.iconType}
                        color={getPlatformConfig(selectedPlatform)?.color}
                        size={16}
                        className="size-6"
                      />
                      <span>{selectedPlatform}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_PLATFORMS.map((platform) => (
                  <SelectItem key={platform.name} value={platform.name}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon 
                        iconName={platform.icon as any}
                        iconSrc={platform.iconSrc}
                        iconType={platform.iconType}
                        color={platform.color}
                        size={16}
                        className="size-6"
                      />
                      <span>{platform.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* 平台图标预览 */}
          {selectedPlatform && (
            <div className={styles.iconPreview}>
              <div className={styles.iconDisplay}>
                <PlatformIcon 
                  iconName={currentPlatformConfig?.icon as any}
                  iconSrc={currentPlatformConfig?.iconSrc}
                  iconType={currentPlatformConfig?.iconType}
                  color={currentPlatformConfig?.color}
                  size={24}
                  className="size-12"
                />
                <span className={styles.iconLabel}>平台图标预览</span>
              </div>
            </div>
          )}

          {/* URL 输入 */}
          <form.Field
            name="url"
            validators={{
              onChange: ({ value }) => {
                if (!value) return '链接地址不能为空';
                
                const validation = validateSocialLinkUrl(value, selectedPlatform);
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
                  <FieldLabel htmlFor={field.name}>链接地址 *</FieldLabel>
                  <div className={styles.urlInputWrapper}>
                    <Link className={styles.urlIcon} />
                    <Input
                      type="url"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isSubmitting}
                      onBlur={field.handleBlur}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder={currentPlatformConfig?.placeholder || "https://example.com"}
                      className={styles.urlInput}
                      required
                    />
                    {field.state.value && (
                      <a
                        href={field.state.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.previewLink}
                        title="预览链接"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                  {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
                  {currentPlatformConfig && (
                    <p className={styles.urlHint}>
                      请输入有效的 {selectedPlatform} 链接地址
                    </p>
                  )}
                </Field>
              );
            }}
          />

          {/* 排序权重 */}
          <form.Field
            name="sortOrder"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>排序权重</FieldLabel>
                  <Input
                    type="number"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                    aria-invalid={isInvalid}
                    placeholder="0"
                    min={0}
                    max={999}
                  />
                  <p className={styles.fieldHint}>
                    数值越小排序越靠前，默认为 0
                  </p>
                  {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
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
            disabled={isSubmitting || !selectedPlatform}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <div className={styles.loadingContent}>
                <Spinner className={styles.spinner} />
                <span>{mode === 'create' ? '添加中...' : '更新中...'}</span>
              </div>
            ) : (
              mode === 'create' ? '添加社交链接' : '更新社交链接'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
