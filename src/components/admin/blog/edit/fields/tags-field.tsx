"use client";

import React from 'react';
import { FieldLabel } from '@/components/shadcn/ui/field';
import { Button } from '@/components/shadcn/ui/button';
import { TagType } from '@/server/types/blog-type';
import { Tag, X } from 'lucide-react';
import styles from '../post-edit-form.module.css';

interface TagsFieldProps {
  availableTags: TagType[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  isSubmitting: boolean;
}

export function TagsField({ availableTags, selectedTagIds, onTagToggle, isSubmitting }: TagsFieldProps) {
  return (
    <div className={styles.field}>
      <FieldLabel className={styles.fieldLabel}>
        文章标签
      </FieldLabel>
      
      <div className={styles.tagsContainer}>
        {availableTags.length > 0 ? (
          <div className={styles.tagsList}>
            {availableTags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <Button
                  key={tag.id}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTagToggle(tag.id)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  <span>{tag.name}</span>
                  {isSelected && <X className="w-3 h-3 opacity-70" />}
                </Button>
              );
            })}
          </div>
        ) : (
          <div className={styles.noTags}>
            <Tag className={styles.noTagsIcon} />
            <p>暂无可用标签</p>
            <p className={styles.noTagsHint}>请先在标签管理页面创建标签</p>
          </div>
        )}
      </div>
      
      {selectedTagIds.length > 0 && (
        <p className={styles.fieldHint}>
          已选择 {selectedTagIds.length} 个标签
        </p>
      )}
    </div>
  );
}
