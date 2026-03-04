import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const feeds = sqliteTable("feeds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  url: text("url").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  lastFetchedAt: text("last_fetched_at"),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
  updatedAt: text("updated_at")
    .notNull()
    .default("(datetime('now'))"),
});

export const newsItems = sqliteTable("news_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  feedId: integer("feed_id")
    .notNull()
    .references(() => feeds.id),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  publicationDate: text("publication_date"),
  sourceName: text("source_name"),
  isPaywalled: integer("is_paywalled", { mode: "boolean" })
    .notNull()
    .default(false),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at")
    .notNull()
    .default("(datetime('now'))"),
});
