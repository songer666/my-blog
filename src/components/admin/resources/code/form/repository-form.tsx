"use client";

import React, { useState } from 'react';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Switch } from '@/components/shadcn/ui/switch';
import { Calendar } from '@/components/shadcn/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/ui/popover';
import { useForm } from '@tanstack/react-form';
import { Loader2, ChevronDownIcon } from 'lucide-react';
import { codeRepositoryUtils } from '@/client/resources/code-api';

interface RepositoryFormData {
  title: string;
  slug: string;
  description: string;
  keywords: string;
  isPublic: boolean;
  createdAt?: Date;
}

interface RepositoryFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<RepositoryFormData>;
  onSubmit: (data: RepositoryFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function RepositoryForm({ mode, initialData, onSubmit, onCancel, isSubmitting = false }: RepositoryFormProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      title: initialData?.title || '',
      slug: initialData?.slug || '',
      description: initialData?.description || '',
      keywords: initialData?.keywords || '',
      isPublic: initialData?.isPublic ?? true,
      createdAt: initialData?.createdAt,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value as RepositoryFormData);
    },
  });

  // 自动生成 slug
  const handleTitleChange = (title: string) => {
    form.setFieldValue('title', title);
    
    // 如果 slug 为空或者是自动生成的，则自动更新
    const currentSlug = form.getFieldValue('slug');
    const currentTitle = form.getFieldValue('title');
    
    if (!currentSlug || currentSlug === codeRepositoryUtils.generateSlugFromTitle(currentTitle)) {
      const newSlug = codeRepositoryUtils.generateSlugFromTitle(title);
      form.setFieldValue('slug', newSlug);
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
            if (value.length < 2) {
              return '标题至少需要2个字符';
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
              placeholder="输入代码库标题"
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
              onChange={(e) => field.handleChange(e.target.value.toLowerCase())}
              onBlur={field.handleBlur}
              placeholder="url-friendly-slug"
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
              placeholder="代码库描述（可选）"
              disabled={isSubmitting}
              rows={3}
            />
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
              placeholder="React, TypeScript, Next.js"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              用逗号分隔多个关键词
            </p>
          </div>
        )}
      />

      <form.Field
        name="isPublic"
        children={(field) => (
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isPublic">公开显示</Label>
              <p className="text-xs text-muted-foreground">
                公开后其他用户可以查看此代码库
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
            <div className="space-y-2">
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
              <p className="text-xs text-muted-foreground">留空则自动使用当前时间</p>
            </div>
          );
        }}
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
