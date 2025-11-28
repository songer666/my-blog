"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Switch } from '@/components/shadcn/ui/switch';
import { useForm } from '@tanstack/react-form';
import { Loader2, Upload, X } from 'lucide-react';
import { videoCollectionUtils } from '@/client/resources/video-api';

interface CollectionFormData {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  keywords: string;
  isPublic: boolean;
}

interface CollectionFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<CollectionFormData>;
  onSubmit: (data: CollectionFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function CollectionForm({ mode, initialData, onSubmit, onCancel, isSubmitting = false }: CollectionFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>(initialData?.coverImage || '');

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      coverImage: initialData?.coverImage || '',
      keywords: initialData?.keywords || '',
      isPublic: initialData?.isPublic ?? true,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as CollectionFormData);
    },
  });

  // 自动生成 slug
  const handleTitleChange = (title: string) => {
    form.setFieldValue('title', title);
    
    // 如果 slug 为空或者是自动生成的，则自动更新
    const currentSlug = form.getFieldValue('slug');
    const currentTitle = form.getFieldValue('title');
    if (!currentSlug || currentSlug === videoCollectionUtils.generateSlugFromTitle(currentTitle)) {
      const newSlug = videoCollectionUtils.generateSlugFromTitle(title);
      form.setFieldValue('slug', newSlug);
    }
  };

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    // 验证文件大小（限制 2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    // 转换为 base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPreviewImage(base64);
      form.setFieldValue('coverImage', base64);
    };
    reader.readAsDataURL(file);
  };

  // 清除图片
  const handleClearImage = () => {
    setPreviewImage('');
    form.setFieldValue('coverImage', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="title"
        validators={{
          onBlur: ({ value }) => {
            if (!value?.trim()) {
              return '标题不能为空';
            }
            if (value.length > 200) {
              return '标题不能超过200个字符';
            }
            return undefined;
          }
        }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={field.state.value}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="例如：我的视频集"
              disabled={isSubmitting}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="slug"
        validators={{
          onBlur: ({ value }) => {
            if (!value?.trim()) {
              return 'Slug 不能为空';
            }
            if (!/^[a-z0-9-]+$/.test(value)) {
              return 'Slug 只能包含小写字母、数字和连字符';
            }
            return undefined;
          }
        }}
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="例如：my-video-collection"
              pattern="[a-z0-9-]+"
              disabled={isSubmitting}
              required
            />
            <p className="text-xs text-muted-foreground">
              只能包含小写字母、数字和连字符
            </p>
            {field.state.meta.errors.length > 0 && (
              <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="简短描述这个视频集..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        )}
      />

      <form.Field
        name="coverImage"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="coverImage">首页图</Label>
            <div className="flex flex-col gap-2">
              {previewImage ? (
                <div className="relative w-full max-w-xs">
                  <img
                    src={previewImage}
                    alt="预览"
                    className="w-full h-40 object-cover rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleClearImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isSubmitting}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    选择图片
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isSubmitting}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                建议尺寸：16:9，最大 2MB
              </p>
            </div>
          </div>
        )}
      />

      <form.Field
        name="keywords"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor="keywords">关键词</Label>
            <Input
              id="keywords"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="关键词1, 关键词2, 关键词3 (逗号分隔)"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              使用逗号分隔多个关键词
            </p>
          </div>
        )}
      />

      <form.Field
        name="isPublic"
        children={(field) => (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">公开状态</Label>
              <p className="text-xs text-muted-foreground">
                公开后其他用户可以查看此视频集
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked)}
              disabled={isSubmitting}
            />
          </div>
        )}
      />

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? '创建' : '保存'}
        </Button>
      </div>
    </form>
  );
}
