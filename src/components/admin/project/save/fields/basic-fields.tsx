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

  // 验证URL格式
  const validateImageUrl = (url: string): boolean => {
    if (!url) return true; // 空值允许
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

  const handleClearImage = () => {
    field.handleChange('');
    setError('');
  };

  return (
    <Field className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        封面图片URL（可选）
      </FieldLabel>
      
      <div className="space-y-3">
        <Input
          type="url"
          id={field.name}
          name={field.name}
          value={field.state.value || ''}
          disabled={isSubmitting}
          onBlur={field.handleBlur}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={styles.fieldInput}
        />
        
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
          </div>
        )}
        
        <p className={styles.fieldHint}>
          请输入图片的完整URL地址，支持 JPG、PNG、GIF、WebP、SVG 等格式
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

