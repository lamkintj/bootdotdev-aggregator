import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    name: text("name").notNull().unique(),
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    last_fetched_at: timestamp("fetched_at"),
    name: text("name").notNull().unique(),
    url: text("url").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}).notNull(),
});

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    feedId: uuid("feed_id").references(() => feeds.id, {onDelete: "cascade"}).notNull(),
    userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}).notNull(),
}, (table) => ([unique("key_pair").on(table.userId, table.feedId)])
);

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    description: text("description"),
    publishedAt: timestamp("published_at").notNull(),
    feedId: uuid("feed_id").references(() => feeds.id, {onDelete: "cascade"}).notNull(),
});