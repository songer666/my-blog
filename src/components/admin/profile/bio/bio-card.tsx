"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/shadcn/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Mail, User } from "lucide-react";
import { BioDialog } from "./bio-dialog";
import { ProfileType } from "@/server/types/profile-type";
import { MdxHydrate } from "@/components/mdx/hydrate";
import type { MdxHydrateProps } from "@/components/mdx/type";
import styles from "./bio-card.module.css";

interface BioCardProps {
    initialData: ProfileType | null;
    serializedBio: MdxHydrateProps['serialized'] | null;
}

export function BioCard({ initialData, serializedBio }: BioCardProps) {


    // 显示数据或默认内容
    const displayName = initialData?.name || "未设置姓名";
    const displayTitle = initialData?.title || "请设置您的职位或简介";
    const displayEmail = initialData?.email || "未设置邮箱";
    const displayBio = initialData?.bio || "请添加您的个人简介...";
    const displayAvatar = initialData?.avatar as string;
    const hasBio = initialData?.bio && serializedBio;

    return (
        <Card className={`${styles.card} relative`}>
            <CardHeader className={styles.header}>
                <div className={styles.profileInfo}>
                    <Avatar className={styles.avatar}>
                        <AvatarImage src={displayAvatar} alt="个人头像" />
                        <AvatarFallback className={styles.avatarFallback}>
                            {displayName.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className={styles.details}>
                        <div className={styles.nameSection}>
                            <CardTitle className={styles.name}>{displayName}</CardTitle>
                            <CardDescription className={styles.title}>
                                {displayTitle}
                            </CardDescription>
                        </div>
                        <div className={styles.contactInfo}>
                            <div className={styles.contactItem}>
                                <Mail className={styles.contactIcon} />
                                <span>{displayEmail}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* 编辑按钮 */}
                <div className="absolute top-4 right-4">
                    <BioDialog
                        initialData={initialData || undefined}
                    />
                </div>
            </CardHeader>
            <CardContent className={styles.content}>
                <div className={styles.bioSection}>
                    <h3 className={styles.bioTitle}>
                        <User className={styles.bioIcon} />
                        个人简介
                    </h3>
                    {hasBio ? (
                        <div className={styles.bioMdxContent}>
                            <MdxHydrate serialized={serializedBio} toc={false} />
                        </div>
                    ) : (
                        <p className={styles.bioText}>
                            {displayBio}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}