# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A personal meal planning web app for family use. Manage a shared meal catalog, create weekly plans, and auto-generate meal plans with smart constraints for winter/summer seasons.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint

# Database (after Drizzle is set up)
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio

# User management (after scripts are created)
pnpm user:add <username>           # Create user, outputs password
pnpm user:delete <username>        # Delete user
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui (new-york style)
- **Database**: PostgreSQL with Drizzle ORM (to be added)
- **Auth**: Auth.js v5 with Credentials provider (to be added)
- **Package Manager**: pnpm

## Architecture

### Route Structure (planned)

- `/` - Redirects to current week plan or `/new`
- `/[weekNumber]` - Display/manage week plan (ISO 8601 format: "2025-W04")
- `/new` - Create new plan with winter/summer generation
- `/meals` - CRUD meal catalog with tag management
- `/tags` - Tag management
- `/auth/signin` - Auth.js sign-in

### Key Conventions

- Use `@/` path alias for imports (maps to project root)
- shadcn/ui components go in `components/ui/`
- Use `cn()` utility from `lib/utils.ts` for className merging
- Week format: ISO 8601 (YYYY-Www), weeks start on Saturday
- All authenticated users share the same data (family model, no per-user data isolation)

### Plan Generation Logic

Two seasonal plans (Winter/Summer) with:

1. Fixed meals added by name
2. Generated meals selected randomly by tag constraints
3. Exclusion of meals marked done in previous week

See `docs/SPEC.md` for detailed generation rules and data model.
