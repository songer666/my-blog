import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Education {
  id: string;
  school: string;
  college: string;
  degree: string;
  major: string;
  schoolUrl?: string | null;
  startYear: number;
  endYear: number;
  logo?: string | null;
  logoMimeType?: string | null;
}

interface EducationSectionProps {
  education: Education[];
}

const styles = {
  container: '',
  titleContainer: 'flex justify-center mb-6 sm:mb-8',
  title: 'text-2xl sm:text-3xl font-medium capitalize mb-6 sm:mb-8 text-center',
  grid: 'grid grid-cols-1 gap-3 sm:gap-6 max-w-3xl mx-auto',
  educationCard: {
    // 小屏幕下更紧凑，logo 和文字上下居中对齐
    container: `group relative flex flex-row items-center gap-2 sm:gap-6 p-3 sm:p-6 rounded-2xl border transition-all duration-300
      bg-stone-50/80 border-stone-200
      dark:bg-card dark:border-border/50 dark:hover:border-purple-500/50 dark:hover:shadow-[0_0_30px_-10px_rgba(168,85,247,0.15)] dark:hover:-translate-y-0.5`.trim(),
    logo: {
      wrapper: 'flex-shrink-0',
      // 小屏幕下 logo 更大，几乎占满宽度（留一点 padding）
      container: 'relative w-[88px] h-[88px] sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white dark:bg-white/10 p-2 sm:p-2 shadow-sm',
      image: 'w-full h-full object-contain',
      imageWithPadding: 'object-contain p-1',
      fallback: 'w-full h-full flex items-center justify-center text-3xl sm:text-2xl font-bold text-muted-foreground bg-muted',
    },
    info: {
      // 文字部分，小屏幕下更紧凑
      container: 'flex-1 text-left space-y-1 sm:space-y-2 w-full min-w-0', // min-w-0 防止 flex 子项溢出
      // 移动端保持 flex-row
      header: 'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-1',
      // 移动端字体稍小，更紧凑
      schoolLink: 'text-sm sm:text-lg font-semibold font-sans text-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate leading-tight',
      schoolName: 'text-sm sm:text-lg font-semibold font-sans text-foreground truncate leading-tight',
      // 日期样式优化，小屏幕下更小
      date: 'text-[10px] sm:text-sm font-mono text-muted-foreground bg-muted/50 px-1.5 sm:px-2 py-0.5 rounded-full border border-border/50 inline-block self-start sm:self-auto whitespace-nowrap',
      details: 'flex flex-col gap-0.5 sm:gap-1 text-muted-foreground/80',
      major: 'font-medium text-xs sm:text-base text-foreground/90 truncate leading-tight',
      // subInfo 保持行布局，小屏幕下更小
      subInfo: 'text-[10px] sm:text-sm flex flex-wrap items-center justify-start gap-x-1.5 sm:gap-x-2 gap-y-0.5 sm:gap-y-1',
      separator: 'w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-muted-foreground/50',
    },
  },
};

export function EducationSection({ education }: EducationSectionProps) {
  const isBase64Image = (src: string) => src.startsWith('data:image/');

  return (
    <div className={styles.container}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>
          Education
        </h2>
      </div>
      
      <div className={styles.grid}>
        {education.map((edu) => (
          <div
            key={edu.id}
            className={styles.educationCard.container}
          >
            {/* Logo */}
            <div className={styles.educationCard.logo.wrapper}>
              <div className={styles.educationCard.logo.container}>
                {edu.logo ? (
                  isBase64Image(edu.logo) ? (
                    <img
                      src={edu.logo}
                      alt={edu.school}
                      className={styles.educationCard.logo.image}
                    />
                  ) : (
                    <Image
                      src={edu.logo}
                      alt={edu.school}
                      fill
                      className={styles.educationCard.logo.imageWithPadding}
                      sizes="64px"
                    />
                  )
                ) : (
                  <div className={styles.educationCard.logo.fallback}>
                    {edu.school.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* 教育信息 */}
            <div className={styles.educationCard.info.container}>
              <div className={styles.educationCard.info.header}>
                {edu.schoolUrl ? (
                  <Link
                    href={edu.schoolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.educationCard.info.schoolLink}
                  >
                    {edu.school}
                  </Link>
                ) : (
                  <h3 className={styles.educationCard.info.schoolName}>
                    {edu.school}
                  </h3>
                )}
                <span className={styles.educationCard.info.date}>
                  {edu.startYear} - {edu.endYear}
                </span>
              </div>
              
              <div className={styles.educationCard.info.details}>
                <div className={styles.educationCard.info.major}>{edu.major}</div>
                <div className={styles.educationCard.info.subInfo}>
                  <span>{edu.college}</span>
                  <span className={styles.educationCard.info.separator} />
                  <span>{edu.degree}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

