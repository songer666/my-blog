import React from 'react';
import { ProjectCardHome } from './project-card-home';

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

interface RecentProjectsProps {
  projects: Project[];
}

const styles = {
  // 响应式网格：手机1列，平板2列，电脑3列
  grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8',
  
  // 空状态
  empty: {
    container: 'text-center py-16',
    text: 'font-sans text-lg text-muted-foreground',
  },
};

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className={styles.empty.container}>
        <p className={styles.empty.text}>暂无项目</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {projects.map((project, index) => (
          <ProjectCardHome
            key={project.id}
            id={project.id}
            title={project.title}
            description={project.description}
            slug={project.slug}
            image={project.image}
            githubUrl={project.githubUrl}
            demoUrl={project.demoUrl}
            createdAt={project.createdAt}
            index={index}
          />
      ))}
    </div>
  );
}
