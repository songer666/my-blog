"use client";

import React from 'react';
import { Label } from '@/components/shadcn/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/ui/select";
import { Code2 } from 'lucide-react';
interface CodeRepositoryFieldProps {
  field: any; // tanstack form field
  isSubmitting: boolean;
  availableRepositories: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}

export function CodeRepositoryField({ field, isSubmitting, availableRepositories }: CodeRepositoryFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="code-repository" className="flex items-center gap-2">
        <Code2 className="h-4 w-4" />
        关联代码库（可选）
      </Label>
      <Select
        value={field.state.value || 'none'}
        onValueChange={(value) => {
          field.handleChange(value === 'none' ? null : value);
        }}
        disabled={isSubmitting}
      >
        <SelectTrigger id="code-repository" className="w-full">
          <SelectValue placeholder="选择关联的代码库" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-muted-foreground">不关联代码库</span>
          </SelectItem>
          {availableRepositories.map((repo) => (
            <SelectItem key={repo.id} value={repo.id}>
              <div className="flex flex-col">
                <span>{repo.title}</span>
                <span className="text-xs text-muted-foreground">/{repo.slug}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        选择一个代码库与此文章关联，便于读者查看相关代码
      </p>
    </div>
  );
}
