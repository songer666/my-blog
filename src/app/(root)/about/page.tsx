import React from 'react';
import { getQueryClient, trpc } from '@/components/trpc/server';
import { serializeMdx } from '@/components/mdx/utils';
import { BioSection } from '@/components/root/about/bio-section';
import { ContactForm } from '@/components/root/about/contact-form';
import { SkillsSection } from '@/components/root/about/skills-section';
import { EducationSection } from '@/components/root/about/education-section';
import { FriendsSection } from '@/components/root/about/friends-section';
import { BorderBeam } from '@/components/shadcn/ui/border-beam';
import { generateAboutMetadata } from './metadata';
import homeConfig from '@/../public/json/home.json';

// 生成页面 metadata
export async function generateMetadata(
  props: any,
  parent: any
) {
  return await generateAboutMetadata(parent);
}

// 强制静态生成（SSG）
export const dynamic = 'force-static';

// 页面样式
const pageStyles = {
  container: 'w-full pt-20 sm:pt-24 pb-24 text-sm',
  mainWrapper: 'max-w-5xl mx-auto px-4 sm:px-12',
  gridContainer: 'flex flex-col lg:flex-row-reverse gap-8 sm:gap-12 lg:gap-16',
  leftColumn: 'lg:w-1/3 lg:shrink-0 lg:h-[calc(100vh-10rem)] lg:sticky lg:top-24 lg:flex lg:items-center lg:justify-center',
  leftColumnInner: 'w-full',
  rightColumn: 'lg:flex-1 space-y-16',
  dividerContainer: 'relative w-full h-px z-20 overflow-visible',
  divider: 'absolute inset-0 bg-border',
  section: '',
  emptyState: 'text-center text-muted-foreground py-16',
  contactTitleWrapper: 'flex justify-center mb-8',
  contactTitle: 'text-3xl font-medium capitalize mb-8 text-center',
};

// 不设置 revalidate，默认永久缓存（SSG），只通过 revalidatePath 清除

export default async function AboutRootPage() {
  // 获取完整的个人资料数据
  const queryClient = getQueryClient();
  const profileResponse = await queryClient.fetchQuery(
    trpc.bio.getPublicFull.queryOptions()
  );
  const profile = profileResponse?.data;

  if (!profile) {
    return (
      <div className={pageStyles.container}>
        <div className={pageStyles.mainWrapper}>
          <p className={pageStyles.emptyState}>暂无个人资料</p>
        </div>
      </div>
    );
  }

  // 序列化个人简介的 MDX 内容
  const serializedBio = profile.bio 
    ? await serializeMdx(profile.bio)
    : null;

  // 将配置文件中的社交链接转换为 BioSection 需要的格式
  const socialLinks = homeConfig.social.map((link, index) => ({
    id: `social-${index}`,
    platform: link.icon, // 使用 icon 字段作为 platform，以匹配 iconMap 的键名
    url: link.href,
    icon: link.icon,
  }));

  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.mainWrapper}>
        <div className={pageStyles.gridContainer}>
          {/* 左侧（桌面端为右侧）：个人简介 */}
          <div className={pageStyles.leftColumn}>
            <div className={pageStyles.leftColumnInner}>
                <BioSection 
                  profile={profile} 
                  serializedBio={serializedBio}
                  socialLinks={socialLinks}
                />
            </div>
          </div>

          {/* 右侧（桌面端为左侧）：主要内容 */}
          <div className={pageStyles.rightColumn}>
            {/* 技能 - 放在最前面显示 */}
            {profile.skillCategories && profile.skillCategories.length > 0 && (
                <div className={pageStyles.section}>
                  <SkillsSection skillCategories={profile.skillCategories} />
                </div>
            )}

            {/* 教育背景 */}
            {profile.education && profile.education.length > 0 && (
              <>
                <div className={`${pageStyles.dividerContainer} mb-16`}>
                  <div className={pageStyles.divider} />
                  <BorderBeam 
                    size={200}
                    duration={8}
                    delay={0}
                    colorFrom="#a855f7"
                    colorTo="#ec4899"
                    borderWidth={1}
                  />
                </div>
                <div className={pageStyles.section}>
                  <EducationSection education={profile.education} />
                </div>
              </>
            )}

            {/* 友链 */}
            {profile.friends && profile.friends.length > 0 && (
              <>
                <div className={`${pageStyles.dividerContainer} mb-16`}>
                  <div className={pageStyles.divider} />
                  <BorderBeam 
                    size={200}
                    duration={8}
                    delay={0}
                    colorFrom="#a855f7"
                    colorTo="#ec4899"
                    borderWidth={1}
                  />
                </div>
                <div className={pageStyles.section}>
                  <FriendsSection friends={profile.friends} />
                </div>
              </>
            )}

            {/* 联系表单 - 放在最后面 */}
              <div className={`${pageStyles.dividerContainer} mb-16`}>
                <div className={pageStyles.divider} />
                <BorderBeam 
                  size={200}
                  duration={8}
                  delay={0}
                  colorFrom="#a855f7"
                  colorTo="#ec4899"
                  borderWidth={1}
                />
              </div>
              <div className={pageStyles.section}>
                <div className={pageStyles.contactTitleWrapper}>
                  <h2 className={pageStyles.contactTitle}>
                    Contact Me
                  </h2>
                </div>
                <ContactForm />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
