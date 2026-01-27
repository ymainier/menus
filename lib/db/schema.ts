import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  (table) => [primaryKey({ columns: [table.mealId, table.tagId] })]
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
    .references(() => meals.id, { onDelete: "restrict" }),
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
