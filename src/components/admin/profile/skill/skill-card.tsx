import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Separator } from "@/components/shadcn/ui/separator";
import { Code, FolderPlus, Plus } from "lucide-react";
import { SkillDialog } from "@/components/admin/profile/skill/skill-dialog";
import { SkillCategoryType, SkillType } from "@/server/types/profile-type";
import { getSkillDisplayClass } from "@/client/profile/skill-api";
import styles from "./skill-card.module.css";

interface SkillCardProps {
    initialData: (SkillCategoryType & { skills?: SkillType[] })[];
}

export function SkillCard({ initialData }: SkillCardProps) {
    return (
        <Card className={`${styles.card} relative`}>
            <CardHeader className={styles.header}>
                <CardTitle className={styles.title}>
                    <Code className={styles.titleIcon} />
                    技能专长
                </CardTitle>
                
                {/* 操作按钮组 */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <SkillDialog
                        mode="create-skill"
                        categories={initialData}
                        trigger={<Plus className="size-4" />}
                        triggerClassName="size-8 rounded-full p-0"
                    />
                    <SkillDialog
                        mode="create-category"
                        categories={initialData}
                        trigger={<FolderPlus className="size-4" />}
                        triggerClassName="size-8 rounded-full p-0"
                    />
                </div>
            </CardHeader>
            <CardContent className={styles.content}>
                <div className={styles.skillContainer}>
                    {initialData && initialData.length > 0 ? (
                        initialData.map((category, categoryIndex) => (
                            <div key={category.id}>
                                <div className={`${styles.skillCategory} group`}>
                                    <div className={styles.categoryHeader}>
                                        <h3 className={styles.categoryTitle}>
                                            {category.name}
                                        </h3>
                                        
                                        {/* 分类操作按钮 */}
                                        <div className={styles.categoryActions}>
                                            <SkillDialog
                                                mode="edit-skill"
                                                categories={initialData}
                                                trigger={<Plus className="size-4" />}
                                                triggerClassName="size-7 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            />
                                            <SkillDialog
                                                mode="delete-category"
                                                categories={initialData}
                                                categoryData={category}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* 技能列表 */}
                                    {category.skills && category.skills.length > 0 ? (
                                        <div className={styles.skillList}>
                                            {category.skills.map((skill) => (
                                                <div key={skill.id} className={`${styles.skillTag} ${getSkillDisplayClass(skill.name)} group`}>
                                                    {skill.icon ? (
                                                        skill.icon.startsWith('data:') ? (
                                                            <img 
                                                                src={skill.icon} 
                                                                alt={`${skill.name}图标`}
                                                                className={styles.skillIcon}
                                                            />
                                                        ) : (
                                                            <span className={styles.skillIconEmoji}>
                                                                {skill.icon}
                                                            </span>
                                                        )
                                                    ) : (
                                                        <div className={styles.skillIconPlaceholder}>
                                                            {skill.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <span className={styles.skillName}>{skill.name}</span>
                                                    
                                                    {/* 技能删除按钮 */}
                                                    <div className={styles.skillActions}>
                                                        <SkillDialog
                                                            mode="delete-skill"
                                                            skillData={skill}
                                                            trigger={
                                                                <span className={styles.deleteSkillButton}>×</span>
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className={styles.emptySkills}>
                                            <p className={styles.emptySkillsText}>该分类下暂无技能</p>
                                            <SkillDialog
                                                mode="edit-skill"
                                                categories={initialData}
                                                trigger={
                                                    <span className={styles.addFirstSkill}>
                                                        <Plus className="size-4 mr-1" />
                                                        添加第一个技能
                                                    </span>
                                                }
                                                triggerClassName="text-sm text-primary hover:text-primary/80"
                                            />
                                        </div>
                                    )}
                                </div>
                                {categoryIndex < initialData.length - 1 && (
                                    <Separator className={styles.separator} />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Code className={styles.emptyIcon} />
                            <p className={styles.emptyText}>暂无技能分类</p>
                            <p className={styles.emptySubtext}>点击右上角按钮开始添加您的技能专长</p>
                            <div className={styles.emptyActions}>
                                <SkillDialog
                                    mode="edit-category"
                                    categories={initialData}
                                    trigger={
                                        <>
                                            <FolderPlus className="size-4 mr-2" />
                                            创建第一个分类
                                        </>
                                    }
                                    triggerClassName="mt-4"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
