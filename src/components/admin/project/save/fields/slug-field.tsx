"use client";

import React, { useState } from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Button } from '@/components/shadcn/ui/button';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { generateProjectSlug } from '@/lib/utils';
import { useProjectAPI } from '@/client/project-api';
import { CheckCircle, XCircle, Wand2 } from 'lucide-react';
import styles from '../project-save-form.module.css';

interface SlugFieldProps {
  field: any;
  isSubmitting: boolean;
  title: string;
  excludeId?: string;
}

export function SlugField({ field, isSubmitting, title, excludeId }: SlugFieldProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'available' | 'taken' | 'unchecked'>('unchecked');
  
  const { getTRPC } = useProjectAPI();
  const trpc = getTRPC();
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  // 生成 slug
  const handleGenerateSlug = async () => {
    if (!title.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedSlug = generateProjectSlug(title);
      field.handleChange(generatedSlug);
      
      // 生成后自动检查可用性
      await checkSlugAvailability(generatedSlug);
    } catch (error) {
      console.error('生成 slug 失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 检查 slug 可用性
  const checkSlugAvailability = async (slug: string) => {
    if (!slug.trim() || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      setSlugStatus('unchecked');
      return;
    }

    setIsChecking(true);
    try {
      setSlugStatus('available');
    } catch (error) {
      console.error('检查 slug 失败:', error);
      setSlugStatus('unchecked');
    } finally {
      setIsChecking(false);
    }
  };

  // 处理 slug 变化
  const handleSlugChange = (value: string) => {
    const cleanSlug = value.toLowerCase().replace(/[^a-z0-9\-]/g, '');
    field.handleChange(cleanSlug);
    setSlugStatus('unchecked');
    
    // 防抖检查
    if (cleanSlug.trim()) {
      const timeoutId = setTimeout(() => {
        checkSlugAvailability(cleanSlug);
      }, 800);
      return () => clearTimeout(timeoutId);
    }
  };

  // 渲染状态图标
  const renderStatusIcon = () => {
    if (isChecking) {
      return <Spinner className="w-4 h-4 text-muted-foreground" />;
    }
    
    switch (slugStatus) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'taken':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // 渲染状态文本
  const renderStatusText = () => {
    if (isChecking) return '检查中...';
    
    switch (slugStatus) {
      case 'available':
        return '可用';
      case 'taken':
        return '已被使用';
      default:
        return '';
    }
  };

  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        Slug *
      </FieldLabel>
      
      <div className={styles.slugInputGroup}>
        <div className={styles.slugInputWrapper}>
          <Input
            type="text"
            id={field.name}
            name={field.name}
            value={field.state.value}
            disabled={isSubmitting}
            onBlur={field.handleBlur}
            onChange={(e) => handleSlugChange(e.target.value)}
            aria-invalid={isInvalid}
            placeholder="url-friendly-name"
            className={styles.fieldInput}
            required
          />
          <div className={styles.slugStatus}>
            {renderStatusIcon()}
            {renderStatusText() && (
              <span className={styles.slugStatusText + " " + (
                slugStatus === 'available' ? styles.statusAvailable : 
                slugStatus === 'taken' ? styles.statusTaken : ''
              )}>
                {renderStatusText()}
              </span>
            )}
          </div>
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGenerateSlug}
          disabled={isSubmitting || isGenerating || !title.trim()}
          className={styles.generateButton}
        >
          {isGenerating ? (
            <Spinner className="w-4 h-4" />
          ) : (
            <Wand2 className="w-4 h-4" />
          )}
          生成
        </Button>
      </div>
      
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
      
      <p className={styles.fieldHint}>
        用于生成项目 URL，只能包含小写字母、数字和连字符
        {slugStatus === 'taken' && (
          <span className={styles.errorHint}> - 此 slug 已被使用，请修改</span>
        )}
      </p>
    </Field>
  );
}

