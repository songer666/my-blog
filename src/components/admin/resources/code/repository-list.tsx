"use client";

import type { CodeRepository } from "@/server/types/resources-type";
import { RepositoryCard } from "./components/repository-card";

const styles = {
  grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.trim(),
  empty: `text-center py-12 text-muted-foreground`.trim(),
};

interface RepositoryListProps {
  repositories: CodeRepository[];
}

export function RepositoryList({ repositories }: RepositoryListProps) {
  if (!repositories || repositories.length === 0) {
    return (
      <div className={styles.empty}>
        <p>暂无代码库</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {repositories.map((repository) => (
        <RepositoryCard key={repository.id} repository={repository} />
      ))}
    </div>
  );
}
