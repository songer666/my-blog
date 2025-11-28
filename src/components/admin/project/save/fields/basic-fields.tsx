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
  const [preview, setPreview] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // 当字段值变化时更新预览
  React.useEffect(() => {
    if (field.state.value && field.state.value.startsWith('data:image/')) {
      setPreview(field.state.value);
    } else {
      setPreview('');
    }
  }, [field.state.value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 检查文件大小（500KB = 512 * 1024 bytes）
    const maxSize = 512 * 1024; // 500KB
    if (file.size > maxSize) {
      setError('图片大小不能超过500KB');
      return;
    }

    try {
      // 压缩并转换为base64
      compressImage(file, (compressedBase64) => {
        field.handleChange(compressedBase64);
        setPreview(compressedBase64);
      });
    } catch (err) {
      setError('图片处理失败');
    }
  };

  // 图片压缩函数
  const compressImage = (file: File, callback: (base64: string) => void) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // 计算压缩后的尺寸（最大宽度800px）
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);

      // 转换为base64，质量设置为0.8
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      
      // 检查压缩后的大小
      const sizeInBytes = Math.round((compressedBase64.length * 3) / 4);
      if (sizeInBytes > 512 * 1024) { // 如果还是超过500KB
        // 进一步降低质量
        const furtherCompressed = canvas.toDataURL('image/jpeg', 0.6);
        callback(furtherCompressed);
      } else {
        callback(compressedBase64);
      }
    };

    img.onerror = () => {
      setError('图片加载失败');
    };

    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setError('图片读取失败');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    field.handleChange('');
    setPreview('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Field className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        封面图片（可选）
      </FieldLabel>
      
      <div className="space-y-3">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          disabled={isSubmitting}
          onChange={handleFileChange}
          className={styles.fieldInput}
        />
        
        {error && (
          <div className={styles.fieldError}>
            {error}
          </div>
        )}
        
        {preview && (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="封面预览"
              className="max-w-xs max-h-48 rounded-md border border-border object-cover"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              disabled={isSubmitting}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}
        
        <p className={styles.fieldHint}>
          支持 JPG、PNG、GIF 等格式，文件大小不超过500KB，图片会自动压缩
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

