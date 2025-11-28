import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 个人基本信息表
export const profile = pgTable("profile", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  title: text("title").notNull(), // 职位/简短介绍
  email: text("email").notNull(),
  bio: text("bio").notNull(), // 个人简介
  avatar: text("avatar"), // base64 编码的图片数据
  avatarMimeType: text("avatar_mime_type"), // 图片类型
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 社交链接表
export const socialLink = pgTable("social_link", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // GitHub, 知乎, CSDN 等
  url: text("url").notNull(),
  icon: text("icon"), // emoji 或自定义图标
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 教育经历表
export const education = pgTable("education", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  school: text("school").notNull(),
  college: text("college").notNull(), // 学院
  degree: text("degree").notNull(), // 学士/硕士/博士
  major: text("major").notNull(), // 专业
  schoolUrl: text("school_url"), // 学校官网链接
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year").notNull(),
  logo: text("logo"), // base64 编码的学校logo
  logoMimeType: text("logo_mime_type"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 技能分类表
export const skillCategory = pgTable("skill_category", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // 前端技术、后端技术等
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 技能项目表
export const skill = pgTable("skill", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").notNull().references(() => skillCategory.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // React, Vue.js 等
  icon: text("icon"), // base64 编码的图标数据
  iconMimeType: text("icon_mime_type"), // 图标类型
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 友链表
export const friend = pgTable("friend", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  profileId: text("profile_id").notNull().references(() => profile.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // 友链名称
  title: text("title").notNull(), // 友链标题/描述
  url: text("url").notNull(), // 友链地址
  avatar: text("avatar"), // base64 编码的头像数据
  avatarMimeType: text("avatar_mime_type"), // 头像类型
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 关系定义
export const profileRelations = relations(profile, ({ many }) => ({
  socialLinks: many(socialLink),
  education: many(education),
  skillCategories: many(skillCategory),
  friends: many(friend),
}));

export const socialLinkRelations = relations(socialLink, ({ one }) => ({
  profile: one(profile, { fields: [socialLink.profileId], references: [profile.id] }),
}));

export const educationRelations = relations(education, ({ one }) => ({
  profile: one(profile, { fields: [education.profileId], references: [profile.id] }),
}));

export const skillCategoryRelations = relations(skillCategory, ({ one, many }) => ({
  profile: one(profile, { fields: [skillCategory.profileId], references: [profile.id] }),
  skills: many(skill),
}));

export const skillRelations = relations(skill, ({ one }) => ({
  category: one(skillCategory, { fields: [skill.categoryId], references: [skillCategory.id] }),
}));

export const friendRelations = relations(friend, ({ one }) => ({
  profile: one(profile, { fields: [friend.profileId], references: [profile.id] }),
}));


// 类型导出
export type Profile = typeof profile.$inferSelect;
export type NewProfile = typeof profile.$inferInsert;
export type SocialLink = typeof socialLink.$inferSelect;
export type NewSocialLink = typeof socialLink.$inferInsert;
export type Education = typeof education.$inferSelect;
export type NewEducation = typeof education.$inferInsert;
export type SkillCategory = typeof skillCategory.$inferSelect;
export type NewSkillCategory = typeof skillCategory.$inferInsert;
export type Skill = typeof skill.$inferSelect;
export type NewSkill = typeof skill.$inferInsert;
export type Friend = typeof friend.$inferSelect;
export type NewFriend = typeof friend.$inferInsert;
