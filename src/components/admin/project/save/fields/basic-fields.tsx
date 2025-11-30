"use client";

import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import styles from '../project-save-form.module.css';

interface DescriptionFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function DescriptionField({ field, isSubmitting }: DescriptionFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        项目描述 *
      </FieldLabel>
      <textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        disabled={isSubmitting}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="请输入项目描述..."
        rows={3}
        className={styles.textarea}
        required
      />
      <div className={styles.textareaFooter}>
        {isInvalid && (
          <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
        )}
        <span className={styles.charCount}>
          {field.state.value.length}/500
        </span>
      </div>
    </Field>
  );
}

interface ImageFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function ImageField({ field, isSubmitting }: ImageFieldProps) {
  const [error, setError] = React.useState<string>('');
  const [uploadMode, setUploadMode] = React.useState<'url' | 'upload'>('url');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 验证URL格式
  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // 空值允许
    // 如果是 base64，直接返回 true
    if (url.startsWith('data:image/')) return true;
    
    try {
      const urlObj = new URL(url);
      // 检查是否是http或https协议
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setError('请输入有效的HTTP或HTTPS图片链接');
        return false;
      }
      // 检查是否是常见的图片格式
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
      const pathname = urlObj.pathname.toLowerCase();
      const hasImageExtension = imageExtensions.some(ext => pathname.endsWith(ext));
      
      if (!hasImageExtension) {
        setError('URL应该指向图片文件（.jpg, .png, .gif, .webp, .svg等）');
        return false;
      }
      
      setError('');
      return true;
    } catch {
      setError('请输入有效的图片URL');
      return false;
    }
  };

  const handleUrlChange = (url: string) => {
    field.handleChange(url);
    if (url.trim()) {
      validateImageUrl(url);
    } else {
      setError('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过 5MB');
      return;
    }

    // 转换为 base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      field.handleChange(base64);
      setError('');
    };
    reader.onerror = () => {
      setError('文件读取失败');
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    field.handleChange('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isBase64 = field.state.value?.startsWith('data:image/');

  return (
    <Field className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        封面图片（可选）
      </FieldLabel>
      
      <div className="space-y-3">
        {/* 切换模式按钮 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUploadMode('url')}
            disabled={isSubmitting}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              uploadMode === 'url'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            URL 链接
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('upload')}
            disabled={isSubmitting}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              uploadMode === 'upload'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            上传图片
          </button>
        </div>

        {/* URL 输入模式 */}
        {uploadMode === 'url' && (
          <Input
            type="url"
            id={field.name}
            name={field.name}
            value={isBase64 ? '' : (field.state.value || '')}
            disabled={isSubmitting}
            onBlur={field.handleBlur}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className={styles.fieldInput}
          />
        )}

        {/* 文件上传模式 */}
        {uploadMode === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isSubmitting}
              onChange={handleFileUpload}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90
                file:cursor-pointer cursor-pointer"
            />
            <p className="text-xs text-muted-foreground mt-1">
              支持 JPG、PNG、GIF、WebP 等格式，最大 5MB
            </p>
          </div>
        )}
        
        {error && (
          <div className={styles.fieldError}>
            {error}
          </div>
        )}
        
        {field.state.value && !error && (
          <div className="relative inline-block">
            <img
              src={field.state.value}
              alt="封面预览"
              className="max-w-xs max-h-48 rounded-md border border-border object-cover"
              onError={() => setError('图片加载失败，请检查URL是否正确')}
            />
            <button
              type="button"
              onClick={handleClearImage}
              disabled={isSubmitting}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
            {isBase64 && (
              <div className="mt-1 text-xs text-muted-foreground">
                Base64 图片 ({(field.state.value.length / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
        )}
        
        <p className={styles.fieldHint}>
          可以输入图片URL或上传本地图片（转为Base64存储）
        </p>
      </div>
    </Field>
  );
}

interface KeyWordsFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function KeyWordsField({ field, isSubmitting }: KeyWordsFieldProps) {
  return (
    <Field className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        关键词（可选）
      </FieldLabel>
      <Input
        type="text"
        id={field.name}
        name={field.name}
        value={field.state.value}
        disabled={isSubmitting}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder="关键词1, 关键词2, 关键词3"
        className={styles.fieldInput}
      />
      <p className={styles.fieldHint}>
        用逗号分隔多个关键词，有助于SEO优化
      </p>
    </Field>
  );
}

