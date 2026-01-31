import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  primaryKey,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Better-auth tables
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const mealTags = pgTable(
  "meal_tags",
  {
    mealId: uuid("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.mealId, table.tagId] })],
);

export const weekPlans = pgTable("week_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekNumber: varchar("week_number", { length: 10 }).notNull().unique(), // ISO 8601 format: "2025-W04"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const plannedMeals = pgTable("planned_meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekPlanId: uuid("week_plan_id")
    .notNull()
    .references(() => weekPlans.id, { onDelete: "cascade" }),
  mealId: uuid("meal_id")
    .notNull()
    .references(() => meals.id, { onDelete: "cascade" }),
  done: boolean("done").default(false).notNull(),
});

// Relations

export const mealsRelations = relations(meals, ({ many }) => ({
  mealTags: many(mealTags),
  plannedMeals: many(plannedMeals),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  mealTags: many(mealTags),
}));

export const mealTagsRelations = relations(mealTags, ({ one }) => ({
  meal: one(meals, {
    fields: [mealTags.mealId],
    references: [meals.id],
  }),
  tag: one(tags, {
    fields: [mealTags.tagId],
    references: [tags.id],
  }),
}));

export const weekPlansRelations = relations(weekPlans, ({ many }) => ({
  plannedMeals: many(plannedMeals),
}));

export const plannedMealsRelations = relations(plannedMeals, ({ one }) => ({
  weekPlan: one(weekPlans, {
    fields: [plannedMeals.weekPlanId],
    references: [weekPlans.id],
  }),
  meal: one(meals, {
    fields: [plannedMeals.mealId],
    references: [meals.id],
  }),
}));
