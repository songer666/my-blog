'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/shadcn/ui/field';
import { Input } from '@/components/shadcn/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select';
import { Spinner } from '@/components/shadcn/ui/spinner';
import { useForm } from '@tanstack/react-form';
import { skillCategoryUpdateSchema, skillUpdateSchema } from '@/server/schema/profile-schema';
import { 
  useSkillAPI, 
  validateSkillName,
  validateCategoryName,
  validateSkillIconFile,
} from '@/client/profile/skill-api';
import { toast } from 'sonner';
import { FolderPlus, Plus, Upload, Image } from 'lucide-react';
import { SkillCategoryType, SkillType } from '@/server/types/profile-type';
import styles from './skill-form.module.css';

interface SkillFormProps {
  mode: 'category' | 'skill';
  categories?: (SkillCategoryType & { skills?: SkillType[] })[];
  onSuccess?: (data: SkillCategoryType | SkillType) => void;
  onCancel?: () => void;
}

export function SkillForm({ mode, categories = [], onSuccess, onCancel }: SkillFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { useCreateSkillCategory, useCreateSkill } = useSkillAPI();
  const createCategoryMutation = useCreateSkillCategory();
  const createSkillMutation = useCreateSkill();

  const form = useForm({
    defaultValues: {
      // 分类相关字段
      categoryName: '',
      categorySortOrder: 0,
      // 技能相关字段
      categoryId: '',
      skillName: '',
      skillIcon: undefined as string | undefined,
      skillIconMimeType: undefined as string | undefined,
      skillSortOrder: 0,
    },
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        
        let result;
        if (mode === 'category') {
          // 创建分类
          const validatedData = skillCategoryUpdateSchema.parse({
            name: values.value.categoryName,
            sortOrder: values.value.categorySortOrder,
          });
          
          result = await createCategoryMutation.mutateAsync(validatedData);
        } else {
          // 创建技能
          const validatedData = skillUpdateSchema.parse({
            categoryId: values.value.categoryId,
            name: values.value.skillName,
            icon: values.value.skillIcon || undefined,
            iconMimeType: values.value.skillIconMimeType || undefined,
            sortOrder: values.value.skillSortOrder,
          });
          
          result = await createSkillMutation.mutateAsync(validatedData);
        }
        
        if (result?.success && result.data) {
          toast.success(result.message || `${mode === 'category' ? '分类' : '技能'}添加成功`, { 
            position: 'top-center' 
          });
          onSuccess?.(result.data);
        } else {
          toast.error(result?.message || '添加失败', { 
            position: 'top-center' 
          });
        }
      } catch (error: any) {
        console.error(`添加${mode === 'category' ? '分类' : '技能'}失败:`, error);
        toast.error(`添加过程中发生错误`, { 
          position: 'top-center' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  // 处理分类选择（技能模式）
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    form.setFieldValue('categoryId', categoryId);
  };

  // 处理技能图标上传
  const handleIconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件
    const validation = validateSkillIconFile(file);
    if (!validation.valid) {
      toast.error(validation.message, { position: 'top-center' });
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setIconPreview(result);
      
      // 更新表单数据
      form.setFieldValue('skillIcon', result);
      form.setFieldValue('skillIconMimeType', file.type);
    };
    reader.readAsDataURL(file);
  };

  // 触发文件选择
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // 清除上传的图标
  const clearUploadedIcon = () => {
    setIconPreview(null);
    form.setFieldValue('skillIcon', '');
    form.setFieldValue('skillIconMimeType', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void form.handleSubmit();
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FieldGroup className={styles.fieldGroup}>
          {mode === 'category' ? (
            <>
              {/* 分类创建模式 */}
              <div className={styles.modeHeader}>
                <FolderPlus className={styles.modeIcon} />
                <h3 className={styles.modeTitle}>添加技能分类</h3>
              </div>


              {/* 分类名称 */}
              <form.Field
                name="categoryName"
                validators={{
                  onChange: ({ value }) => {
                    const validation = validateCategoryName(value);
                    return validation.valid ? undefined : validation.message;
                  },
                }}
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>分类名称 *</FieldLabel>
                      <Input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        disabled={isSubmitting}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="如：前端技术、后端技术等"
                        maxLength={50}
                        required
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
                    </Field>
                  );
                }}
              />


              {/* 分类排序 */}
              <form.Field
                name="categorySortOrder"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>排序权重</FieldLabel>
                      <Input
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        disabled={isSubmitting}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        max={999}
                      />
                      <p className={styles.fieldHint}>
                        数值越小排序越靠前，默认为 0
                      </p>
                    </Field>
                  );
                }}
              />
            </>
          ) : (
            <>
              {/* 技能创建模式 */}
              <div className={styles.modeHeader}>
                <Plus className={styles.modeIcon} />
                <h3 className={styles.modeTitle}>添加技能</h3>
              </div>

              {/* 选择分类 */}
              <Field>
                <FieldLabel>所属分类 *</FieldLabel>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择技能分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span>{category.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* 技能图标区域 - 支持上传和手动输入 */}
              <div className={styles.iconSection}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconPreview} onClick={triggerFileUpload}>
                    {iconPreview ? (
                      <img src={iconPreview} alt="技能图标预览" className={styles.iconImage} />
                    ) : (
                      <Image className={styles.iconPlaceholder} />
                    )}
                  </div>
                  <div className={styles.iconButtons}>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={triggerFileUpload}
                      disabled={isSubmitting || !selectedCategory}
                      className={styles.uploadButton}
                    >
                      <Upload className="size-4 mr-2" />
                      {iconPreview ? '重新上传' : '上传图标'}
                    </Button>
                    {iconPreview && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearUploadedIcon}
                        disabled={isSubmitting}
                        className="text-destructive hover:text-destructive"
                      >
                        清除
                      </Button>
                    )}
                  </div>
                </div>
                <div className={styles.iconInfo}>
                  <p className={styles.iconTitle}>技能图标（可选）</p>
                  <p className={styles.iconSubtitle}>可以上传图片文件，或在下方手动输入 emoji</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
                  onChange={handleIconUpload}
                  className={styles.fileInput}
                />
              </div>

              {/* 手动输入图标 */}
              <form.Field
                name="skillIcon"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>或手动输入图标</FieldLabel>
                      <Input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={iconPreview ? '' : (field.state.value || '')}
                        disabled={isSubmitting || !selectedCategory || !!iconPreview}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="如：⚛️、💚、🐍 等 emoji"
                        maxLength={10}
                      />
                      <p className={styles.fieldHint}>
                        {iconPreview ? '已上传图标文件，如需使用 emoji 请先清除上传的图标' : '输入 emoji 或文字作为图标'}
                      </p>
                    </Field>
                  );
                }}
              />

              {/* 技能名称 */}
              <form.Field
                name="skillName"
                validators={{
                  onChange: ({ value }) => {
                    const validation = validateSkillName(value);
                    return validation.valid ? undefined : validation.message;
                  },
                }}
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>技能名称 *</FieldLabel>
                      <Input
                        type="text"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        disabled={isSubmitting || !selectedCategory}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="如：React、Vue.js、Python等"
                        maxLength={50}
                        required
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors.map(error => ({ message: error }))} />}
                    </Field>
                  );
                }}
              />


              {/* 技能排序 */}
              <form.Field
                name="skillSortOrder"
                children={(field) => {
                  return (
                    <Field>
                      <FieldLabel htmlFor={field.name}>排序权重</FieldLabel>
                      <Input
                        type="number"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        disabled={isSubmitting || !selectedCategory}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min={0}
                        max={999}
                      />
                      <p className={styles.fieldHint}>
                        数值越小排序越靠前，默认为 0
                      </p>
                    </Field>
                  );
                }}
              />
            </>
          )}
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
            disabled={isSubmitting || (mode === 'skill' && !selectedCategory)}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <div className={styles.loadingContent}>
                <Spinner className={styles.spinner} />
                <span>添加中...</span>
              </div>
            ) : (
              `添加${mode === 'category' ? '分类' : '技能'}`
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
