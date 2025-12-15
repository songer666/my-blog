import { z } from "zod";
import {
  tagSchema,
  tagUpdateSchema,
  postSchema,
  postUpdateSchema,
  postCreateSchema,
  postTagsSchema,
} from "@/server/schema/blog-schema";

// Tag Types
export type TagType = z.infer<typeof tagSchema>;
export type TagUpdateType = z.infer<typeof tagUpdateSchema>;

// Tag List Type
export type TagList = TagType[];

// Post Types
export type PostType = z.infer<typeof postSchema>;
export type PostUpdateType = z.infer<typeof postUpdateSchema>;
export type PostCreateType = z.infer<typeof postCreateSchema>;

// Post with Tags Type (用于详情页显示，包含 content)
export type PostWithTagsType = PostType & {
  tags?: TagType[];
  relatedCodeRepository?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
  };
};

// Post List Item Type (用于列表页显示，不包含 content)
export type PostListItemType = Omit<PostType, 'content'> & {
  tags?: TagType[];
  relatedCodeRepository?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
  };
};

// Post List Type
export type PostList = PostWithTagsType[];

// PostTags Types
export type PostTagsType = z.infer<typeof postTagsSchema>;

// Post View Types (访问统计)
export type PostViewType = {
  id: string;
  postId: string;
  ip: string;
  userAgent: string | null;
  createdAt: Date;
};

// Post Stats Type (统计数据)
export type PostStatsType = {
  postId: string;
  viewCount: number;
};
