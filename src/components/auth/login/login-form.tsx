'use client';

import React, {CSSProperties, FormEvent, useState} from 'react';
import { cn } from '@/lib/utils';
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
import { loginRequestSchema } from '@/server/schema/user-schema';
import { authApi } from '@/client/auth-api';
import { toast } from 'sonner';
import styles from './login.module.css';

interface LoginFormProps extends React.ComponentProps<'div'> {
    className?: string;
}

export function LoginForm({ className, ...props }: LoginFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm({
        defaultValues: { email: '', password: '' },
        validators: { onSubmit: loginRequestSchema },
        onSubmit: async (values) => {
            try {
                setIsSubmitting(true);
                const { data, error } = await authApi.signIn(
                    values.value.email,
                    values.value.password,
                    true,
                    '/admin/dashboard'
                );
                
                if (error) {
                    const message = error?.code === 'INVALID_CREDENTIALS' 
                        ? '用户名或密码错误' 
                        : '登录失败,请联系超级管理员';
                    toast.error(message, { position: 'top-center' });
                }
                
                if (data?.redirect === true) {
                    toast.success('登录成功', { position: 'top-center' });
                }
            } catch (e: any) {
                console.error('Login error:', e);
                toast.error('登录过程中发生错误', { position: 'top-center' });
            } finally {
                setIsSubmitting(false);
            }
        }
    });

    // 渲染邮箱字段
    const renderEmailField = () => (
        <form.Field
            name="email"
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                    <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>邮箱</FieldLabel>
                        <Input
                            type="email"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="请输入您的邮箱"
                            autoComplete="email"
                            autoFocus
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

    // 渲染密码字段
    const renderPasswordField = () => (
        <form.Field
            name="password"
            children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                    <Field data-invalid={isInvalid}>
                        <div className={styles.forgotRow}>
                            <FieldLabel htmlFor={field.name}>密码</FieldLabel>
                            <a href="#" className={styles.forgot}>
                                忘记密码?
                            </a>
                        </div>
                        <Input
                            type="password"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled={isSubmitting}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            aria-invalid={isInvalid}
                            placeholder="请输入您的密码"
                            autoComplete="current-password"
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
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        void form.handleSubmit();
    };

    return (
        <main className={cn(styles.container, className)} {...props}>
            {/* 背景图片区域 */}
            <section className={styles.imageSection}>
                <div className={styles.imageOverlay} />
                <img
                    src="/form/placeholder.svg"
                    alt="登录页面背景图"
                    className={styles.backgroundImage}
                />
            </section>

            {/* 登录表单区域 */}
            <section className={styles.formSection}>
                <div className={styles.formContainer}>
                    <header className={styles.header}>
                        <h1 className={styles.title}>气质猫个人博客</h1>
                        <p className={styles.subtitle}>
                            登录您的账号进入管理端
                        </p>
                    </header>

                    <form
                        id="login-form"
                        className={styles.form}
                        onSubmit={handleSubmit}
                        aria-busy={isSubmitting}
                        noValidate
                    >
                        <FieldGroup className={styles.fieldGroup}>
                            {renderEmailField()}
                            {renderPasswordField()}
                        </FieldGroup>

                        <Field className={styles.submitField}>
                            <Button
                                type="submit"
                                form="login-form"
                                className={styles.submitBtn}
                                disabled={isSubmitting}
                                aria-disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <span className={styles.loadingContent}>
                                        <Spinner className={styles.spinner} aria-hidden="true" />
                                        <span>登录中...</span>
                                    </span>
                                ) : (
                                    '登录'
                                )}
                            </Button>
                        </Field>
                    </form>
                </div>
            </section>
        </main>
    );
}
