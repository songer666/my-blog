import { pgTable, text, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

export const message = pgTable("message", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull(),
  content: text("content").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/**
 * 消息发送限制表
 * 用于记录 IP+UA 组合的最后发送时间（30分钟限制）
 */
export const messageRateLimit = pgTable("message_rate_limit", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  ipAddress: varchar("ip_address", { length: 255 }).notNull(),
  userAgent: text("user_agent"),
  lastSentAt: timestamp("last_sent_at", { mode: "date" }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});
