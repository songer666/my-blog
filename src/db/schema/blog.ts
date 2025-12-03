import {boolean, pgTable, text, timestamp, unique} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {codeRepository} from "./resources";

export const tag = pgTable("tag", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const post = pgTable("post", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    image: text("image"),
    visible: boolean('visible').default(false).notNull(),
    keyWords: text("key_words"),
    // 关联的代码库ID（一对一，可选）
    relatedCodeRepositoryId: text("related_code_repository_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

// === 中间表（多对多桥表）===
export const postTags = pgTable("post_tags", {
        id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
        postId: text("post_id").notNull().references(() => post.id, { onDelete: "cascade" }),
        tagId: text("tag_id").notNull().references(() => tag.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (t) => ({
        uq: unique().on(t.postId, t.tagId),
    }),
);

// === 博客访问统计表 ===
export const postView = pgTable("post_view", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id").notNull().references(() => post.id, { onDelete: "cascade" }),
    ip: text("ip").notNull(),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    // 同一篇文章+同一IP的唯一约束（防止短时间内重复记录）
    uq: unique().on(t.postId, t.ip),
}));

// === Relations ===
export const postRelations = relations(post, ({ many, one }) => ({
    postTags: many(postTags),
    relatedCodeRepository: one(codeRepository, {
        fields: [post.relatedCodeRepositoryId],
        references: [codeRepository.id],
    }),
    views: many(postView),
}));

export const tagRelations = relations(tag, ({ many }) => ({
    postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
    post: one(post, { fields: [postTags.postId], references: [post.id] }),
    tag: one(tag, { fields: [postTags.tagId], references: [tag.id] }),
}));

export const postViewRelations = relations(postView, ({ one }) => ({
    post: one(post, { fields: [postView.postId], references: [post.id] }),
}));