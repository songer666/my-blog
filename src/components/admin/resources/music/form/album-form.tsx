"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Switch } from '@/components/shadcn/ui/switch';
import { Calendar } from '@/components/shadcn/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/ui/popover';
import { useForm } from '@tanstack/react-form';
import { Loader2, Upload, X, ChevronDownIcon } from 'lucide-react';
import { musicAlbumUtils } from '@/client/resources/music-api';

const styles = {
  form: `space-y-4`.trim(),
  fieldContainer: `space-y-2`.trim(),
  errorText: `text-sm text-destructive`.trim(),
  hintText: `text-xs text-muted-foreground`.trim(),
  modeButtonsContainer: `flex gap-2`.trim(),
  urlInputContainer: `space-y-2`.trim(),
  uploadButtonContainer: `flex items-center gap-2`.trim(),
  previewContainer: `relative w-full max-w-xs`.trim(),
  previewImage: `w-full h-40 object-cover rounded-md border`.trim(),
  deleteButton: `absolute top-2 right-2`.trim(),
  switchContainer: `flex items-center justify-between`.trim(),
  switchLabelContainer: `space-y-0.5`.trim(),
  actionsContainer: `flex justify-end gap-2 pt-4`.trim(),
};

interface AlbumFormData {
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  tags: string;
  isPublic: boolean;
  createdAt?: Date;
}

interface AlbumFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<AlbumFormData>;
  onSubmit: (data: AlbumFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function AlbumForm({ mode, initialData, onSubmit, onCancel, isSubmitting = false }: AlbumFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string>(initialData?.coverImage || '');
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');
  const [urlError, setUrlError] = useState<string>('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      coverImage: initialData?.coverImage || '',
      tags: initialData?.tags || '',
      isPublic: initialData?.isPublic ?? true,
      createdAt: initialData?.createdAt,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as AlbumFormData);
    },
  });

  // 自动生成 slug
  const handleTitleChange = (title: string) => {
    form.setFieldValue('title', title);
    
    // 如果 slug 为空或者是自动生成的，则自动更新
    const currentSlug = form.getFieldValue('slug');
    const currentTitle = form.getFieldValue('title');
    if (!currentSlug || currentSlug === musicAlbumUtils.generateSlugFromTitle(currentTitle)) {
      const newSlug = musicAlbumUtils.generateSlugFromTitle(title);
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
    setUrlError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 处理 URL 输入
  const handleUrlChange = (url: string) => {
    form.setFieldValue('coverImage', url);
    setPreviewImage(url);
    
    if (url && !url.startsWith('data:image/')) {
      try {
        new URL(url);
        setUrlError('');
      } catch {
        setUrlError('请输入有效的图片URL');
      }
    } else {
      setUrlError('');
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className={styles.form}
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
          <div className={styles.fieldContainer}>
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={field.state.value}
              onChange={(e) => handleTitleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="例如：我的音乐专辑"
              disabled={isSubmitting}
              required
            />
            {field.state.meta.errors.length > 0 && (
              <p className={styles.errorText}>{field.state.meta.errors[0]}</p>
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
          <div className={styles.fieldContainer}>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="例如：my-music-album"
              pattern="[a-z0-9-]+"
              disabled={isSubmitting}
              required
            />
            <p className={styles.hintText}>
              只能包含小写字母、数字和连字符
            </p>
            {field.state.meta.errors.length > 0 && (
              <p className={styles.errorText}>{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      />

      <form.Field
        name="description"
        children={(field) => (
          <div className={styles.fieldContainer}>
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="简短描述这个专辑..."
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        )}
      />

      <form.Field
        name="coverImage"
        children={(field) => (
          <div className={styles.fieldContainer}>
            <Label htmlFor="coverImage">封面图片</Label>
            
            {/* 切换模式按钮 */}
            <div className={styles.modeButtonsContainer}>
              <Button
                type="button"
                variant={uploadMode === 'url' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadMode('url')}
                disabled={isSubmitting}
              >
                URL 链接
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadMode('upload')}
                disabled={isSubmitting}
              >
                上传图片
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {/* URL 输入模式 */}
              {uploadMode === 'url' && !previewImage && (
                <div className={styles.fieldContainer}>
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={field.state.value?.startsWith('data:image/') ? '' : field.state.value}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    disabled={isSubmitting}
                  />
                  {urlError && (
                    <p className="text-sm text-destructive">{urlError}</p>
                  )}
                </div>
              )}

              {/* 文件上传模式 */}
              {uploadMode === 'upload' && !previewImage && (
                <div className={styles.uploadButtonContainer}>
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

              {/* 预览图片 */}
              {previewImage && (
                <div className={styles.previewContainer}>
                  <img
                    src={previewImage}
                    alt="预览"
                    className={styles.previewImage}
                    onError={() => setUrlError('图片加载失败')}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className={styles.deleteButton}
                    onClick={handleClearImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {field.state.value?.startsWith('data:image/') && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Base64 图片 ({(field.state.value.length / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
              )}

              <p className={styles.hintText}>
                {uploadMode === 'upload' ? '建议尺寸：16:9，最大 2MB' : '可以输入图片URL或上传本地图片'}
              </p>
            </div>
          </div>
        )}
      />

      <form.Field
        name="tags"
        children={(field) => (
          <div className={styles.fieldContainer}>
            <Label htmlFor="tags">标签</Label>
            <Input
              id="tags"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="流行, 摇滚, 电子 (逗号分隔)"
              disabled={isSubmitting}
            />
            <p className={styles.hintText}>
              使用逗号分隔多个标签
            </p>
          </div>
        )}
      />

      <form.Field
        name="isPublic"
        children={(field) => (
          <div className={styles.switchContainer}>
            <div className={styles.switchLabelContainer}>
              <Label htmlFor="isPublic">公开状态</Label>
              <p className={styles.hintText}>
                公开后其他用户可以查看此专辑
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

      <form.Field
        name="createdAt"
        children={(field) => {
          const selectedDate = field.state.value ? (typeof field.state.value === 'string' ? new Date(field.state.value) : field.state.value) : undefined;
          
          const handleDateSelect = (date: Date | undefined) => {
            if (date) {
              const newDate = new Date(date);
              if (selectedDate) {
                newDate.setHours(selectedDate.getHours());
                newDate.setMinutes(selectedDate.getMinutes());
                newDate.setSeconds(selectedDate.getSeconds());
              } else {
                const now = new Date();
                newDate.setHours(now.getHours());
                newDate.setMinutes(now.getMinutes());
                newDate.setSeconds(now.getSeconds());
              }
              field.handleChange(newDate);
              setDatePickerOpen(false);
            } else {
              field.handleChange(undefined);
              setDatePickerOpen(false);
            }
          };

          const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const timeValue = e.target.value;
            if (!timeValue) return;
            const [hours, minutes, seconds] = timeValue.split(':');
            const newDate = selectedDate ? new Date(selectedDate) : new Date();
            newDate.setHours(parseInt(hours));
            newDate.setMinutes(parseInt(minutes));
            newDate.setSeconds(seconds ? parseInt(seconds) : 0);
            field.handleChange(newDate);
          };

          const formatTime = (date: Date) => {
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
          };

          return (
            <div className={styles.fieldContainer}>
              <Label>创建时间（可选）</Label>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="date-picker" className="text-sm text-muted-foreground">日期</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker"
                        className="justify-between font-normal"
                        disabled={isSubmitting}
                      >
                        {selectedDate ? selectedDate.toLocaleDateString('zh-CN') : '选择日期'}
                        <ChevronDownIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        captionLayout="dropdown"
                        onSelect={handleDateSelect}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="time-picker" className="text-sm text-muted-foreground">时间</Label>
                  <Input
                    type="time"
                    id="time-picker"
                    step="1"
                    value={selectedDate ? formatTime(selectedDate) : ''}
                    onChange={handleTimeChange}
                    disabled={isSubmitting || !selectedDate}
                    className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                </div>
                {selectedDate && (
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => field.handleChange(undefined)}
                      disabled={isSubmitting}
                    >
                      清除
                    </Button>
                  </div>
                )}
              </div>
              <p className={styles.hintText}>留空则自动使用当前时间</p>
            </div>
          );
        }}
      />

      <div className={styles.actionsContainer}>
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
