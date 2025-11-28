import { Card, CardContent } from "@/components/shadcn/ui/card";
import { UserType } from "@/server/types/user-type";
import styles from './users-card.module.css';

interface UsersCardProps {
  users: UserType[];
}

export function UsersCard({ users }: UsersCardProps) {
  const totalUsers = users?.length || 0;
  const verifiedUsers = users?.filter(user => user.emailVerified).length || 0;
  const unverifiedUsers = users?.filter(user => !user.emailVerified).length || 0;

  return (
    <div className={styles.statsGrid}>
      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statNumber}>{totalUsers}</div>
          <div className={styles.statLabel}>总用户数</div>
        </CardContent>
      </Card>
      
      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statNumber}>{verifiedUsers}</div>
          <div className={styles.statLabel}>已验证用户</div>
        </CardContent>
      </Card>
      
      <Card className={styles.statCard}>
        <CardContent className={styles.statContent}>
          <div className={styles.statNumber}>{unverifiedUsers}</div>
          <div className={styles.statLabel}>待验证用户</div>
        </CardContent>
      </Card>
    </div>
  );
}