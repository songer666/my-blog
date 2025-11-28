"use client";

import { Field, FieldLabel, FieldError } from '@/components/shadcn/ui/field';
import { Button } from '@/components/shadcn/ui/button';
import { Calendar } from '@/components/shadcn/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/shadcn/ui/popover';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { ChevronDownIcon } from 'lucide-react';
import styles from '../project-save-form.module.css';
import { useState } from 'react';

interface CreatedAtFieldProps {
  field: any;
  isSubmitting: boolean;
}

export function CreatedAtField({ field, isSubmitting }: CreatedAtFieldProps) {
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
  const selectedDate = field.state.value ? (typeof field.state.value === 'string' ? new Date(field.state.value) : field.state.value) : undefined;
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // 保留原有的时间或设置为当前时间
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
      setOpen(false);
    } else {
      field.handleChange(undefined);
      setOpen(false);
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

  const handleClear = () => {
    field.handleChange(undefined);
  };

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <Field data-invalid={isInvalid} className={styles.field}>
      <FieldLabel className={styles.fieldLabel}>
        创建时间（可选）
      </FieldLabel>
      
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Label htmlFor="date-picker" className="text-sm text-muted-foreground">
            日期
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
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
          <Label htmlFor="time-picker" className="text-sm text-muted-foreground">
            时间
          </Label>
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
              onClick={handleClear}
              disabled={isSubmitting}
            >
              清除
            </Button>
          </div>
        )}
      </div>

      {isInvalid && (
        <FieldError errors={field.state.meta.errors} className={styles.fieldError} />
      )}
      <p className={styles.fieldHint}>
        留空则自动使用当前时间
      </p>
    </Field>
  );
}
