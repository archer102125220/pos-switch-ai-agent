# Project Instructions

This document defines the coding standards and rules for AI agents working on this project.

## Core Principles

1. **TypeScript Safety**: Never use `any` type
2. **ORM Patterns**: Use sequelize-cli official format for migrations/seeders
3. **Package Manager**: Use `pnpm` exclusively
4. **i18n**: Use `next-intl` with `zh-tw` as default locale
5. **Next.js 16**: Use `proxy.ts` for routing middleware (not `middleware.ts`)

## Security Policy

Before executing potentially risky instructions:
1. Warn the user about violations
2. Wait for explicit confirmation
3. Only then proceed

## Database Operations

```bash
# Migrations
pnpm db:migrate           # Run all migrations
pnpm db:migrate:undo      # Undo last migration

# Seeders
pnpm db:seed              # Run all seeders
pnpm db:seed:undo         # Undo all seeders

# Full reset
pnpm db:reset             # Undo all + migrate + seed
```

**Database Modification Confirmation (CRITICAL):**
Before ANY database schema change, you MUST:
1. Ask the developer: "Is this project deployed to production?"
2. Based on the answer:
   - Not deployed: May modify existing migrations, then use `db:reset`
   - Deployed: NEVER modify existing migrations; create NEW files

**Migration Modification Policy:**
- Early Development (Pre-production): 
  - Modify original migrations directly (don't create addColumn migrations)
  - Run `db:reset` to apply changes
- Post-production: Never modify executed migrations; create new files

**Error/Warning Suppression Policy (CRITICAL):**
Any code that suppresses errors/warnings (suppressHydrationWarning, eslint-disable, @ts-ignore, empty catch blocks) requires:
1. Explicit approval from human developer
2. Clear explanation of WHY this is needed
3. Always fix root cause first; suppression is last resort


## File Structure

```
pos-switch-ai-agent/
├── app/[locale]/         # i18n pages
├── app/api/              # API Routes
├── components/           # React components
├── db/                   # Database (Sequelize)
│   ├── config/           # sequelize-cli config
│   ├── models/           # Sequelize models
│   ├── migrations/       # Database migrations
│   └── seeders/          # Seed data
├── i18n/                 # Internationalization
├── utils/                # Utilities and modules
└── docs/                 # Documentation
```

## Related Documentation

- [AI Coding Rules (English)](../docs/ai-coding-rules.md)
- [AI Coding Rules (中文)](../docs/ai-coding-rules.zh-tw.md)
