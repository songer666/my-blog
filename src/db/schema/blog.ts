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

export const postRelations = relations(post, ({ many, one }) => ({
    postTags: many(postTags),
    relatedCodeRepository: one(codeRepository, {
        fields: [post.relatedCodeRepositoryId],
        references: [codeRepository.id],
    }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
    postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
    post: one(post, { fields: [postTags.postId], references: [post.id] }),
    tag: one(tag, { fields: [postTags.tagId], references: [tag.id] }),
}));