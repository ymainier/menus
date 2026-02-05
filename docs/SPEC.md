# Meal Planner - Product Specification

## Overview

Personal meal planning web app for family use. Manage a shared meal catalog, create weekly plans, and auto-generate meal plans with smart constraints for winter/summer seasons.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Auth.js v5 (Credentials provider)

## Authentication

Simple username/password sign-in. No sign-up flow, no password reset UI—user management handled via CLI scripts.

- Session strategy: JWT
- Protected routes via Next.js middleware
- All authenticated users share the same data (family meal catalog)

### CLI Scripts (`/scripts`)

```bash
pnpm run user:add <username>           # Creates user, outputs generated password
pnpm run user:delete <username>        # Deletes user
pnpm run user:reset-password <username> # Generates new password, outputs it
```

## Data Model

All data is shared across users (no userId foreign keys except on User table).

### User

| Column       | Type      | Notes          |
| ------------ | --------- | -------------- |
| id           | uuid      | Primary key    |
| username     | string    | Unique         |
| passwordHash | string    |                |
| createdAt    | timestamp | Default: now() |

### Meal

| Column    | Type      | Notes          |
| --------- | --------- | -------------- |
| id        | uuid      | Primary key    |
| name      | string    | Unique         |
| createdAt | timestamp | Default: now() |

### Tag

| Column | Type   | Notes       |
| ------ | ------ | ----------- |
| id     | uuid   | Primary key |
| name   | string | Unique      |

### MealTag (junction table)

| Column | Type | Notes                        |
| ------ | ---- | ---------------------------- |
| mealId | uuid | FK → Meal, on delete cascade |
| tagId  | uuid | FK → Tag, on delete cascade  |

Primary key: (mealId, tagId)

### WeekPlan

| Column     | Type      | Notes                              |
| ---------- | --------- | ---------------------------------- |
| id         | uuid      | Primary key                        |
| weekNumber | string    | ISO 8601 format (e.g., "2025-W04") |
| createdAt  | timestamp | Default: now()                     |

Unique constraint on weekNumber.

### PlannedMeal

| Column     | Type    | Notes                            |
| ---------- | ------- | -------------------------------- |
| id         | uuid    | Primary key                      |
| weekPlanId | uuid    | FK → WeekPlan, on delete cascade |
| mealId     | uuid    | FK → Meal, on delete restrict    |
| done       | boolean | Default: false                   |

## Routes

| Route           | Purpose                                         |
| --------------- | ----------------------------------------------- |
| `/`             | Redirect to current week plan or `/new` if none |
| `/[weekNumber]` | Display week plan, mark meals as done           |
| `/new`          | Create new plan with generation buttons         |
| `/meals`        | CRUD meals, manage tags on meals                |
| `/tags`         | List tags, show meal associations               |
| `/auth/signin`  | Sign-in page (Auth.js)                          |

## Week Plan Structure

- **Week format**: ISO 8601 (YYYY-Www), e.g., "2025-W04"
- **Week starts**: Saturday
- **Slots**: 14 meals (7 days × lunch + dinner) — soft limit, can vary
- **No slot assignment**: Meals form a to-do pool, not assigned to specific days/times
- **Done tracking**: Each PlannedMeal has a `done` boolean

## Generation Logic

### Overview

When generating a plan:

1. Add all **fixed meals** (by name)
2. For each **generated rule**, select random meals matching tag constraints
3. Exclude meals marked as done in the **previous week's plan**

### Previous Week Detection

```sql
SELECT id FROM WeekPlan
WHERE weekNumber < :currentWeek
ORDER BY weekNumber DESC
LIMIT 1
```

If no previous week exists → no exclusions applied.

### Excluded Meals Query

```sql
SELECT mealId FROM PlannedMeal
WHERE weekPlanId = :previousWeekPlanId
AND done = true
```

### Winter Plan (12 meals)

**Fixed meals** (added by name, always included):

- "Soupe pour tous"
- "Soupe AC"
- "Soupe Y"
- "Congel AC"
- "Congel Y"

**Generated meals** (random selection, excludes previous week's done meals):

| Count | Must have tag | Must NOT have tags |
| ----- | ------------- | ------------------ |
| 1     | long          | soup               |
| 2     | pasta         | soup, long         |
| 2     | rice          | soup, long, pasta  |
| 1     | egg           | soup, long         |
| 1     | quiche        | soup, long         |

### Summer Plan (11 meals)

**Fixed meals** (added by name, always included):

- "Barbecue"
- "Congel AC"
- "Congel Y"

**Generated meals** (random selection, excludes previous week's done meals):

| Count | Must have tag | Must NOT have tags |
| ----- | ------------- | ------------------ |
| 1     | long          | _(none)_           |
| 2     | pasta         | long               |
| 2     | rice          | long, pasta        |
| 1     | egg           | long               |
| 1     | quiche        | long               |
| 1     | salad         | long               |

## Page Specifications

### `/` (Home)

- Check if a WeekPlan exists for the current ISO week
- If yes → redirect to `/[weekNumber]`
- If no → redirect to `/new`

### `/[weekNumber]` (Week Plan View)

- Display week number as header
- List all PlannedMeals for this week
- Each meal shows: name, tags, done checkbox
- Clicking checkbox toggles `done` status
- Show progress: "X / Y meals done"
- Link to `/new` to create next week's plan

### `/new` (Create Plan)

- Input: week number (default: next week based on current date)
- Buttons:
  - "Generate Winter Plan"
  - "Generate Summer Plan"
  - "Create Empty Plan"
- On generate:
  - Run generation logic
  - Create WeekPlan + PlannedMeals
  - Redirect to `/[weekNumber]`
- Error handling: show which constraints couldn't be satisfied (not enough meals matching tags)

### `/meals` (Meal Catalog)

- List all meals with their tags
- Search/filter by name or tag
- Create new meal (name input + tag selector)
- Edit meal (change name, add/remove tags)
- Delete meal (with confirmation)
- Inline tag management: create new tags on the fly

### `/tags` (Tag Management)

- List all tags
- Each tag shows count of associated meals
- Click tag to see associated meals
- Create new tag
- Delete tag (with confirmation, cascades to MealTag)
- Rename tag

## UI/UX Notes

- All pages should have max-width of `max-w-2xl` and be centered
- Use shadcn/ui components: Button, Input, Checkbox, Card, Dialog, Badge (for tags)
- Responsive design (mobile-friendly for checking off meals while cooking)
- Toast notifications for actions (meal created, plan generated, etc.)
- Loading states for async operations

## Error Handling

### Generation Errors

If a constraint can't be satisfied (e.g., no meals with tag "quiche" available):

- Show warning listing unsatisfied constraints
- Still create plan with satisfied constraints
- User can manually add meals afterward

### Edge Cases

- Deleting a meal that's in a PlannedMeal → restrict (don't allow)
- Deleting a tag → cascade (remove from MealTag)
- Deleting a WeekPlan → cascade (remove PlannedMeals)
- Previous week plan deleted → next generation has no exclusions

## File Structure

```
menus/
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── signin/
│   │           └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx          # Auth check wrapper
│   │   ├── page.tsx            # Home redirect logic
│   │   ├── [weekNumber]/
│   │   │   └── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   ├── meals/
│   │   │   └── page.tsx
│   │   └── tags/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── meals/
│   │   │   └── route.ts
│   │   ├── tags/
│   │   │   └── route.ts
│   │   ├── plans/
│   │   │   └── route.ts
│   │   └── planned-meals/
│   │       └── route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   └── ui/                     # shadcn components
├── lib/
│   ├── auth.ts                 # Auth.js config
│   ├── db/
│   │   ├── index.ts            # Drizzle client
│   │   └── schema.ts           # Drizzle schema
│   ├── generation.ts           # Plan generation logic
│   └── week.ts                 # ISO week utilities
├── scripts/
│   ├── user-add.ts
│   ├── user-delete.ts
│   └── user-reset-password.ts
├── drizzle.config.ts
├── middleware.ts               # Auth middleware
└── package.json
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=<random-string>
```

## Scripts in package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "user:add": "tsx scripts/user-add.ts",
    "user:delete": "tsx scripts/user-delete.ts",
    "user:reset-password": "tsx scripts/user-reset-password.ts"
  }
}
```
