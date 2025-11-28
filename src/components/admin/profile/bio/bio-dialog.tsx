'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { BioForm } from '@/components/admin/profile/bio/bio-form';
import { Edit } from 'lucide-react';
import { ProfileType } from '@/server/types/profile-type';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BioDialogProps {
  initialData?: ProfileType;
  trigger?: React.ReactNode;
  triggerClassName?: string;
}

export function BioDialog({ 
  initialData, 
  trigger,
  triggerClassName 
}: BioDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setOpen(false);
    toast.success("个人资料更新成功", { position: 'top-center' });
    // 刷新页面以显示最新数据
    router.refresh();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const defaultTrigger = (
    <Button
      variant="outline"
      size="sm"
      className={triggerClassName}
    >
      <Edit className="size-4 mr-2" />
      编辑
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="size-5" />
            编辑个人信息
          </DialogTitle>
          <DialogDescription>
            更新您的个人基本信息，包括姓名、职位、邮箱、个人简介和头像。
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          <BioForm
            initialData={initialData}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
