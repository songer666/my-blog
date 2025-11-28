"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkillCategory {
  id: string;
  name: string;
  icon?: string | null;
  skills: Array<{
    id: string;
    name: string;
    icon?: string | null;
    iconMimeType?: string | null;
  }>;
}

interface SkillsSectionProps {
  skillCategories: SkillCategory[];
}

const styles = {
  container: 'max-w-[53rem] scroll-mt-28 text-center mb-28 sm:mb-40 mx-auto',
  titleContainer: 'flex justify-center mb-8',
  title: 'text-3xl font-medium capitalize mb-8 text-center',
  skillList: 'flex flex-wrap justify-center gap-2 text-md text-gray-800',
  skillItem: 'bg-white border border-black/10 rounded-xl py-2 px-3 dark:bg-white/10 dark:text-white/80',
};

const fadeInAnimationVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

export function SkillsSection({ skillCategories }: SkillsSectionProps) {
  // 扁平化所有技能，只取名字
  const skills = skillCategories.flatMap((category) =>
    category.skills.map((skill) => skill.name)
  );

  return (
    <section
      id="skills"
      className={styles.container}
    >
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>
          My Skills
        </h2>
      </div>
      <ul className={styles.skillList}>
        {skills.map((skill, index) => (
          <motion.li
            className={styles.skillItem}
            key={index}
            variants={fadeInAnimationVariants}
            initial="initial"
            whileInView="animate"
            viewport={{
              once: true,
            }}
            custom={index}
          >
            {skill}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

