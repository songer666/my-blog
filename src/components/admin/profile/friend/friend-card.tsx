import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Separator } from "@/components/shadcn/ui/separator";
import { Users, Plus, ExternalLink } from "lucide-react";
import { FriendDialog } from "./friend-dialog";
import { FriendType } from "@/server/types/profile-type";
import { getFriendDisplayColor } from "@/client/profile/friend-api";
import styles from "./friend-card.module.css";

interface FriendCardProps {
    initialData: FriendType[];
}

export function FriendCard({ initialData }: FriendCardProps) {
    return (
        <Card className={`${styles.card} relative`}>
            <CardHeader className={styles.header}>
                <CardTitle className={styles.title}>
                    <Users className={styles.titleIcon} />
                    友情链接
                </CardTitle>
                
                {/* 添加友链按钮 */}
                <div className="absolute top-4 right-4">
                    <FriendDialog
                        mode="create"
                        trigger={
                            <Plus className="size-4" />
                        }
                        triggerClassName="size-8 rounded-full p-0"
                    />
                </div>
            </CardHeader>
            <CardContent className={styles.content}>
                <div className={styles.friendContainer}>
                    {initialData && initialData.length > 0 ? (
                        <div className={styles.friendGrid}>
                            {initialData.map((friend) => (
                                <div key={friend.id} className={`${styles.friendItem} group`}>
                                    <div className={styles.friendMain}>
                                        <a 
                                            href={friend.url}
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={styles.friendAvatarWrapper}
                                            title={`访问 ${friend.name}`}
                                        >
                                            {friend.avatar ? (
                                                <img 
                                                    src={friend.avatar} 
                                                    alt={`${friend.name}头像`}
                                                    className={styles.friendAvatar}
                                                />
                                            ) : (
                                                <div 
                                                    className={styles.friendAvatarPlaceholder}
                                                    style={{ backgroundColor: getFriendDisplayColor(friend.name) + '20' }}
                                                >
                                                    <span 
                                                        className={styles.friendAvatarText}
                                                        style={{ color: getFriendDisplayColor(friend.name) }}
                                                    >
                                                        {friend.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </a>
                                        <div className={styles.friendInfo}>
                                            <div className={styles.friendHeader}>
                                                <a 
                                                    href={friend.url}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={styles.friendName}
                                                    title={`访问 ${friend.name}`}
                                                >
                                                    {friend.name}
                                                </a>
                                                <a 
                                                    href={friend.url}
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className={styles.friendUrl}
                                                    title="访问友链"
                                                >
                                                    <ExternalLink className="size-4" />
                                                </a>
                                            </div>
                                            <p className={styles.friendTitle}>{friend.title}</p>
                                        </div>
                                    </div>
                                    
                                    {/* 删除按钮 */}
                                    <div className={styles.friendActions}>
                                        <FriendDialog
                                            mode="delete"
                                            friendData={friend}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <Users className={styles.emptyIcon} />
                            <p className={styles.emptyText}>暂无友情链接</p>
                            <p className={styles.emptySubtext}>点击右上角按钮添加您的友情链接</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
