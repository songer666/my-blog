"use client";

import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { MdxEditor } from '@/components/mdx/components/editor';
import styles from '../post-edit-form.module.css';

interface ContentFieldProps {
  field: any; // 简化类型
  isSubmitting: boolean;
}

export function ContentField({ field, isSubmitting }: ContentFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        文章内容 *
      </FieldLabel>
      
      <div className={styles.contentEditorWrapper}>
        <MdxEditor
          content={field.state.value}
          setContent={(content) => field.handleChange(content || '')}
          disabled={isSubmitting}
        />
      </div>
      
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
      
      <p className={styles.fieldHint}>
        支持 Markdown 语法，可以使用预览功能查看渲染效果
      </p>
    </Field>
  );
}
