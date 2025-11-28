"use client";

import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { MdxEditor } from '@/components/mdx/components/editor';
import styles from '../project-save-form.module.css';

interface ContentFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function ContentField({ field, isSubmitting }: ContentFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        项目内容 *
      </FieldLabel>
      
      <div className={styles.contentEditorFullscreen}>
        <MdxEditor
          content={field.state.value || ''}
          setContent={(value) => field.handleChange(value)}
          disabled={isSubmitting}
        />
      </div>
      
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
      
      <p className={styles.fieldHint}>
        支持 MDX 语法，可使用 Markdown 和 React 组件。图片语法：![描述](图片URL)
      </p>
    </Field>
  );
}

