"use client";

import { useState } from "react";
import { EditRepositoryDialog } from "./edit-repository-dialog";
import { DeleteRepositoryDialog } from "./delete-repository-dialog";
import { Button } from "@/components/shadcn/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { CodeRepository } from "@/server/types/resources-type";

const styles = {
  icon: `h-4 w-4 mr-2`.trim(),
};

interface RepositoryDialogWrapperProps {
  repository: CodeRepository;
}

export function RepositoryDialogWrapper({ repository }: RepositoryDialogWrapperProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
        <Pencil className={styles.icon} />
        编辑
      </Button>
      <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
        <Trash2 className={styles.icon} />
        删除
      </Button>

      <EditRepositoryDialog
        repository={repository}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <DeleteRepositoryDialog
        repository={repository}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
