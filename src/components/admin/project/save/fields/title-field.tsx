"use client";

import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import styles from '../project-save-form.module.css';

interface TitleFieldProps {
  field: any;
  isSubmitting: boolean;
  onTitleChange: (title: string) => void;
}

export function TitleField({ field, isSubmitting, onTitleChange }: TitleFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        项目标题 *
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
        placeholder="请输入项目标题"
        className={styles.fieldInput}
        required
      />
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
    </Field>
  );
}

