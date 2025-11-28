import {boolean, pgTable, text, timestamp} from "drizzle-orm/pg-core";
import {relations} from "drizzle-orm";
import {codeRepository} from "./resources";

export const project = pgTable("project", {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description").notNull(),
    slug: text("slug").notNull().unique(),
    content: text("content").notNull(),
    image: text("image"),
    githubUrl: text("github_url"),
    demoUrl: text("demo_url"),
    visible: boolean('visible').default(false).notNull(),
    keyWords: text("key_words"),
    // 关联的代码库ID（一对一，可选）
    codeRepositoryId: text("code_repository_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const projectRelations = relations(project, ({ one }) => ({
    relatedCodeRepository: one(codeRepository, {
        fields: [project.codeRepositoryId],
        references: [codeRepository.id],
    }),
}));