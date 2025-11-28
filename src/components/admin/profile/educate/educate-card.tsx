import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Separator } from "@/components/shadcn/ui/separator";
import { Calendar, GraduationCap, Plus } from "lucide-react";
import { EducateDialog } from "./educate-dialog";
import { EducationType } from "@/server/types/profile-type";
import styles from "./educate-card.module.css";

interface EducateCardProps {
    initialData: EducationType[];
}

export function EducateCard({ initialData }: EducateCardProps) {
    return (
        <Card className={`${styles.card} relative`}>
            <CardHeader className={styles.header}>
                <CardTitle className={styles.title}>
                    <GraduationCap className={styles.titleIcon} />
                    教育经历
                </CardTitle>
                
                {/* 添加教育经历按钮 */}
                <div className="absolute top-4 right-4">
                    <EducateDialog
                        trigger={
                            <Plus className="size-4" />
                        }
                        triggerClassName="size-8 rounded-full p-0"
                    />
                </div>
            </CardHeader>
            <CardContent className={styles.content}>
                <div className={styles.educationList}>
                    {initialData && initialData.length > 0 ? (
                        initialData.map((edu, index) => (
                            <div key={edu.id}>
                                <div className={styles.educationItem}>
                                    <img 
                                        src={edu.logo!}
                                        alt={`${edu.school}校徽`}
                                        className={styles.schoolLogo}
                                    />
                                    <div className={styles.educationInfo}>
                                        <div className={styles.schoolInfo}>
                                            <h3 className={styles.schoolName}>
                                                {edu.schoolUrl ? (
                                                    <a 
                                                        href={edu.schoolUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="hover:text-primary transition-colors"
                                                    >
                                                        {edu.school}
                                                    </a>
                                                ) : (
                                                    edu.school
                                                )}
                                            </h3>
                                            <p className={styles.degreeInfo}>
                                                {edu.college} · {edu.major} · {edu.degree}
                                            </p>
                                        </div>
                                        <div className={styles.timeInfo}>
                                            <Calendar className={styles.timeIcon} />
                                            <span className={styles.timeText}>
                                                {edu.startYear} - {edu.endYear}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* 删除按钮 */}
                                    <EducateDialog
                                        mode="delete"
                                        educationId={edu.id}
                                        educationName={edu.school}
                                    />
                                </div>
                                {index < initialData.length - 1 && (
                                    <Separator className={styles.separator} />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <GraduationCap className={styles.emptyIcon} />
                            <p className={styles.emptyText}>暂无教育经历</p>
                            <p className={styles.emptySubtext}>点击右上角按钮添加您的教育经历</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
