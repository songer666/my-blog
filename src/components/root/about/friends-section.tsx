import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface Friend {
  id: string;
  name: string;
  title: string;
  url: string;
  avatar?: string | null;
  avatarMimeType?: string | null;
}

const styles = {
  container: 'mt-8',
  title: 'text-3xl font-medium capitalize mb-8 text-foreground',
  grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto',
  friendCard: {
    container: 'group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300',
    header: {
      container: 'flex items-center gap-4 w-full',
      avatar: {
        wrapper: 'flex-shrink-0',
        avatarContainer: 'relative w-12 h-12 rounded-full overflow-hidden border border-border/50 shadow-sm group-hover:scale-105 transition-transform duration-300',
        image: 'w-full h-full object-cover',
      },
      info: {
        container: 'flex-1 min-w-0',
        name: 'text-lg font-semibold font-sans text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors',
        title: 'text-sm text-muted-foreground/80 font-sans line-clamp-1 group-hover:text-muted-foreground transition-colors',
      },
    },
  },
};

interface FriendsSectionProps {
  friends: Friend[];
}

export function FriendsSection({ friends }: FriendsSectionProps) {
  const isBase64Image = (src: string) => src.startsWith('data:image/');

  return (
    <div className={styles.container}>
      {/* 标题 */}
      <div className="flex justify-center mb-8">
        <h2 className={styles.title}>Friends</h2>
      </div>

      {/* 朋友链接网格 */}
      <div className={styles.grid}>
        {friends.map((friend) => (
          <Link
            key={friend.id}
            href={friend.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.friendCard.container}
          >
            {/* 头部：头像和信息 */}
            <div className={styles.friendCard.header.container}>
              {/* 头像 */}
              <div className={styles.friendCard.header.avatar.wrapper}>
                <div className={styles.friendCard.header.avatar.avatarContainer}>
                  {friend.avatar ? (
                    isBase64Image(friend.avatar) ? (
                      <img
                        src={friend.avatar}
                        alt={friend.name}
                        className={styles.friendCard.header.avatar.image}
                      />
                    ) : (
                      <Image
                        src={friend.avatar}
                        alt={friend.name}
                        fill
                        className={styles.friendCard.header.avatar.image}
                        sizes="48px"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* 信息 */}
              <div className={styles.friendCard.header.info.container}>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className={styles.friendCard.header.info.name}>
                    {friend.name}
                  </h3>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-purple-500 transition-colors opacity-0 group-hover:opacity-100" />
                </div>
                <p className={styles.friendCard.header.info.title}>
                  {friend.title}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

