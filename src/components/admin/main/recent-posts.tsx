import { Card, CardContent, CardHeader, CardTitle } from "@/components/shadcn/ui/card";
import { Badge } from "@/components/shadcn/ui/badge";
import { Eye, EyeOff, Calendar } from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  visible: boolean;
  createdAt: Date | string;
}

interface RecentPostsProps {
  posts: Post[];
}

export function RecentPosts({ posts }: RecentPostsProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>最近文章</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              暂无文章
            </p>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/admin/dashboard/blog/${post.id}`}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    {post.visible ? (
                      <Eye className="h-3 w-3 text-green-600 flex-shrink-0" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                </div>
                <Badge variant={post.visible ? "default" : "secondary"} className="ml-2 flex-shrink-0">
                  {post.visible ? "公开" : "隐藏"}
                </Badge>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
