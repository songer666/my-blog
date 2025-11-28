import React from 'react';
import { ProjectCard } from './project-card';
import { BlurFade } from '@/components/shadcn/ui/blur-fade';

interface Project {
  id: string;
  title: string;
  description: string;
  slug: string;
  image?: string | null;
  keyWords?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  createdAt: Date;
}

interface ProjectListProps {
  projects: Project[];
}

const styles = {
  empty: {
    container: 'text-center py-16',
    title: 'text-xl text-muted-foreground font-sans',
    subtitle: 'text-sm text-muted-foreground mt-2 font-sans',
  },
  container: 'grid grid-cols-1 lg:grid-cols-2 gap-8',
};

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className={styles.empty.container}>
        <p className={styles.empty.title}>暂无项目</p>
        <p className={styles.empty.subtitle}>敬请期待更多精彩内容</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {projects.map((project, index) => (
        <BlurFade key={project.id} delay={0.15 + index * 0.1} inView>
          <ProjectCard {...project} index={index} />
        </BlurFade>
      ))}
    </div>
  );
}

