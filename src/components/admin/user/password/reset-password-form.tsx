"use client";

import React, { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import styles from './reset-password-form.module.css';

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: { 
      newPassword: '',
      confirmPassword: ''
    },
    validators: {
      onSubmit: ({ value }) => {
        if (value.newPassword !== value.confirmPassword) {
          return { message: '两次输入的密码不一致' };
        }
        if (value.newPassword.length < 8) {
          return { message: '密码至少需要8个字符' };
        }
        return undefined;
      }
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 使用 token 重置密码
        const result = await authClient.resetPassword({
          newPassword: values.value.newPassword,
          token: token
        });
        
        console.log('密码重置结果:', result);
        
        toast.success('密码重置成功', { 
          position: 'top-center',
          description: '您的密码已成功重置，请使用新密码重新登录'
        });
        
        // 重置成功后，登出用户并跳转到登录页
        setTimeout(async () => {
          await authClient.signOut();
          router.push('/admin');
        }, 1000);
        
      } catch (error: any) {
        console.error('密码重置错误:', error);
        
        toast.error('密码重置失败', {
          description: error?.message || '网络错误，请稍后重试',
          position: 'top-center',
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 渲染新密码字段
  const renderNewPasswordField = () => (
    <form.Field
      name="newPassword"
      validators={{
        onChange: ({ value }) => {
          if (!value || value.length < 8) {
            return { message: '密码至少需要8个字符' };
          }
          return undefined;
        }
      }}
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>新密码</FieldLabel>
            <Input
              type="password"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="请输入新密码（至少8位）"
              autoComplete="new-password"
              required
            />
            {isInvalid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </Field>
        );
      }}
    />
  );

  // 渲染确认密码字段
  const renderConfirmPasswordField = () => (
    <form.Field
      name="confirmPassword"
      validators={{
        onChange: ({ value }) => {
          const newPassword = form.getFieldValue('newPassword');
          if (!value) {
            return { message: '请确认新密码' };
          }
          if (value !== newPassword) {
            return { message: '两次输入的密码不一致' };
          }
          return undefined;
        }
      }}
      children={(field) => {
        const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
        return (
          <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>确认新密码</FieldLabel>
            <Input
              type="password"
              id={field.name}
              name={field.name}
              value={field.state.value}
              disabled={isSubmitting}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              aria-invalid={isInvalid}
              placeholder="请再次输入新密码"
              autoComplete="new-password"
              required
            />
            {isInvalid && (
              <FieldError errors={field.state.meta.errors} />
            )}
          </Field>
        );
      }}
    />
  );

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <div className={styles.container}>
      <div className={styles.warningBox}>
        <p className={styles.warningText}>
          重置密码后，您将被自动登出，需要使用新密码重新登录(你只有2分钟的时间修改密码)。
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className={styles.form}
        aria-busy={isSubmitting}
        noValidate
      >
        <FieldGroup className={styles.fieldGroup}>
          {renderNewPasswordField()}
          {renderConfirmPasswordField()}
        </FieldGroup>

        <div className={styles.buttonGroup}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className={styles.cancelButton}
          >
            取消
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <span className={styles.loadingContent}>
                <Spinner className={styles.spinner} aria-hidden="true" />
                <span>重置中...</span>
              </span>
            ) : (
              '重置密码'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
