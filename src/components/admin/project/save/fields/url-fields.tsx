"use client";

import React from 'react';
import { Field, FieldError, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Github, ExternalLink } from 'lucide-react';
import styles from '../project-save-form.module.css';

interface GithubUrlFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function GithubUrlField({ field, isSubmitting }: GithubUrlFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4" />
          GitHub 链接（可选）
        </div>
      </FieldLabel>
      <Input
        type="url"
        id={field.name}
        name={field.name}
        value={field.state.value}
        disabled={isSubmitting}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="https://github.com/username/repo"
        className={styles.fieldInput}
      />
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
      <p className={styles.fieldHint}>
        项目的 GitHub 仓库链接
      </p>
    </Field>
  );
}

interface DemoUrlFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function DemoUrlField({ field, isSubmitting }: DemoUrlFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  
  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel htmlFor={field.name} className={styles.fieldLabel}>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          演示链接（可选）
        </div>
      </FieldLabel>
      <Input
        type="url"
        id={field.name}
        name={field.name}
        value={field.state.value}
        disabled={isSubmitting}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="https://demo.example.com"
        className={styles.fieldInput}
      />
      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
      <p className={styles.fieldHint}>
        项目的在线演示链接
      </p>
    </Field>
  );
}

