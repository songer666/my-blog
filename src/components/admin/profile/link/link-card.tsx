import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Separator } from "@/components/shadcn/ui/separator";
import { Link, Plus, ExternalLink } from "lucide-react";
import { LinkDialog } from "./link-dialog";
import { SocialLinkType } from "@/server/types/profile-type";
import { generateLinkDisplayName, getPlatformConfig } from "@/client/profile/link-api";
import { PlatformIcon } from "./platform-icon";
import styles from "./link-card.module.css";

interface LinkCardProps {
    initialData: SocialLinkType[];
}

export function LinkCard({ initialData }: LinkCardProps) {
    return (
        <Card className={`${styles.card} relative`}>
            <CardHeader className={styles.header}>
                <CardTitle className={styles.title}>
                    <Link className={styles.titleIcon} />
                    社交链接
                </CardTitle>
                
                {/* 添加社交链接按钮 */}
                <div className="absolute top-4 right-4">
                    <LinkDialog
                        mode="create"
                        trigger={
                            <Plus className="size-4" />
                        }
                        triggerClassName="size-8 rounded-full p-0"
                    />
                </div>
            </CardHeader>
            <CardContent className={styles.content}>
                <div className={styles.linksContainer}>
                    {initialData && initialData.length > 0 ? (
                        initialData.map((link, index) => (
                            <div key={link.id}>
                                <div className={styles.linkItem}>
                                    <div className={styles.linkMain}>
                                        <div className={styles.linkIconWrapper}>
                                            <PlatformIcon 
                                                iconName={link.icon as any}
                                                iconSrc={getPlatformConfig(link.platform)?.iconSrc}
                                                svgPath={getPlatformConfig(link.platform)?.svgPath}
                                                iconType={getPlatformConfig(link.platform)?.iconType}
                                                color={getPlatformConfig(link.platform)?.color}
                                                size={20}
                                                className={styles.linkIcon}
                                            />
                                        </div>
                                        <div className={styles.linkInfo}>
                                            <div className={styles.linkHeader}>
                                                <h3 className={styles.linkPlatform}>{link.platform}</h3>
                                                <a 
                                                    href={link.url}
                                                    target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                                                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                                                    className={styles.linkUrl}
                                                    title={link.url.startsWith('mailto:') ? '发送邮件' : '访问链接'}
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </div>
                                            <p className={styles.linkDescription}>
                                                {generateLinkDisplayName(link.platform, link.url)}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* 操作按钮 */}
                                    <div className={styles.linkActions}>
                                        <LinkDialog
                                            mode="update"
                                            socialLinkData={link}
                                        />
                                        <LinkDialog
                                            mode="delete"
                                            socialLinkData={link}
                                        />
                                    </div>
                                </div>
                                {index < initialData.length - 1 && (
                                    <Separator className={styles.separator} />
                                )}
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyState}>
                            <Link className={styles.emptyIcon} />
                            <p className={styles.emptyText}>暂无社交链接</p>
                            <p className={styles.emptySubtext}>点击右上角按钮添加您的社交媒体或个人网站链接</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
