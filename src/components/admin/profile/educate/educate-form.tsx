'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { educationUpdateSchema } from '@/server/schema/profile-schema';
import { useEducateOperations, validateSchoolLogoFile } from '@/client/profile/educate-api';
import { Upload, School } from 'lucide-react';
import { EducationType } from '@/server/types/profile-type';
import styles from './educate-form.module.css';
import {toast} from "sonner";

interface EducateFormProps {
  onSuccess?: (data: EducationType) => void;
  onCancel?: () => void;
}

export function EducateForm({ onSuccess, onCancel }: EducateFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createEducation } = useEducateOperations();

  const form = useForm({
    defaultValues: {
      school: '',
      college: '',
      degree: '',
      major: '',
      schoolUrl: '',
      startYear: new Date().getFullYear() - 4,
      endYear: new Date().getFullYear(),
      logo: undefined as string | undefined,
      logoMimeType: undefined as string | undefined,
      sortOrder: 0,
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        // 手动验证数据
        const validatedData = educationUpdateSchema.parse({
          ...values.value,
          logo: values.value.logo || undefined,
          logoMimeType: values.value.logoMimeType || undefined,
          schoolUrl: values.value.schoolUrl || undefined,
        });
        
        const result = await createEducation(validatedData);
        
        if (result.success && result.data) {
          onSuccess?.(result.data);
        }
      } catch (error: any) {
        // 错误处理已经在 API 层完成
        console.error('添加教育经历失败:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 处理学校 logo 上传
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateSchoolLogoFile(file);
    if (!validation.valid) {
      toast.error(validation.message, { position: 'top-center' });
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setLogoPreview(result);
      
      // 更新表单数据
      form.setFieldValue('logo', result);
      form.setFieldValue('logoMimeType', file.type);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <div className={styles.container}>
      {/* 学校 logo 上传区域 */}
      <div className={styles.logoSection}>
        <div className={styles.logoContainer}>
          <div className={styles.logoPreview} onClick={triggerFileUpload}>
            {logoPreview ? (
              <img src={logoPreview} alt="学校logo预览" className={styles.logoImage} />
            ) : (
              <School className={styles.logoPlaceholder} />
            )}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={triggerFileUpload}
            disabled={isSubmitting}
            className={styles.uploadButton}
          >
            <Upload className="size-4 mr-2" />
            上传校徽
          </Button>
        </div>
        <div className={styles.logoInfo}>
          <p className={styles.logoTitle}>学校校徽（可选）</p>
          <p className={styles.logoSubtitle}>支持 JPEG、PNG、WebP 格式，大小不超过 1MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleLogoUpload}
          className={styles.fileInput}
        />
      </div>

      {/* 表单区域 */}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FieldGroup className={styles.fieldGroup}>
          {/* 学校名称 */}
          <form.Field
            name="school"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>学校名称 *</FieldLabel>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="请输入学校名称"
                    maxLength={100}
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* 学院名称 */}
          <form.Field
            name="college"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>学院名称 *</FieldLabel>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="请输入学院名称"
                    maxLength={100}
                    required
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* 专业和学位 */}
          <div className={styles.rowFields}>
            <form.Field
              name="major"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>专业 *</FieldLabel>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isSubmitting}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="请输入专业名称"
                      maxLength={100}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="degree"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>学位 *</FieldLabel>
                    <Input
                      type="text"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isSubmitting}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="如：学士、硕士、博士"
                      maxLength={50}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </div>

          {/* 时间范围 */}
          <div className={styles.rowFields}>
            <form.Field
              name="startYear"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>开始年份 *</FieldLabel>
                    <Input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isSubmitting}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      aria-invalid={isInvalid}
                      placeholder="2020"
                      min={1900}
                      max={new Date().getFullYear() + 10}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />

            <form.Field
              name="endYear"
              children={(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>结束年份 *</FieldLabel>
                    <Input
                      type="number"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled={isSubmitting}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                      aria-invalid={isInvalid}
                      placeholder="2024"
                      min={1900}
                      max={new Date().getFullYear() + 10}
                      required
                    />
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
          </div>

          {/* 学校官网 */}
          <form.Field
            name="schoolUrl"
            children={(field) => {
              const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>学校官网（可选）</FieldLabel>
                  <Input
                    type="url"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    disabled={isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="https://www.school.edu.cn"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>

        {/* 操作按钮 */}
        <div className={styles.actions}>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
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
              <div className={styles.loadingContent}>
                <Spinner className={styles.spinner} />
                <span>添加中...</span>
              </div>
            ) : (
              '添加教育经历'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
