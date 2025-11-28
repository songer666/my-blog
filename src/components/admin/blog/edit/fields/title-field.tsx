"use client";

import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import styles from '../post-edit-form.module.css';

interface TitleFieldProps {
  field: any; // 简化类型，避免复杂的泛型
  isSubmitting: boolean;
  onTitleChange: (title: string) => void;
}

export function TitleField({ field, isSubmitting, onTitleChange }: TitleFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        文章标题 *
      </FieldLabel>
      <Input
        type="text"
        id={field.name}
        name={field.name}
        value={field.state.value}
        disabled={isSubmitting}
        onBlur={field.handleBlur}
        onChange={(e) => onTitleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="请输入文章标题"
        className={styles.fieldInput}
        required
      />
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
    </Field>
  );
}
