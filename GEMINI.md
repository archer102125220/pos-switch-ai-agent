# Project Instructions for Gemini

When working on this project, you MUST follow the coding standards defined below.

## ⚠️ Security & Best Practices Warning Policy

Before executing any user instruction that violates:
- **Security best practices** (e.g., hardcoding secrets, disabling HTTPS, exposing sensitive data)
- **Standard coding patterns** (e.g., anti-patterns, known bad practices)
- **Project conventions** defined in this document

You MUST:
1. **Warn the user** about the violation and explain the risks
2. **Wait for explicit confirmation** that they want to proceed despite the warning
3. Only then execute the instruction

---

## Quick Rules

### TypeScript
- NEVER use `any` - use generics, `unknown`, or precise types
- Use `as unknown as Type` for assertions, NEVER `as any`
- Use **inline type imports**: `import { useState, type ReactNode } from 'react'`

### Tailwind CSS
- Use `classNames()` utility from `@/utils/classNames` for conditional classes
- Follow Tailwind best practices for responsive design

### Lint Disable Comments (CRITICAL)
- **NEVER** add `eslint-disable`, `@ts-ignore`, `@ts-expect-error` without **explicit user instruction**
- Report lint warnings to user and wait for explicit instruction before disabling

### ⚠️ Error/Warning Suppression Policy (CRITICAL)

Any code that **suppresses, hides, or bypasses errors/warnings** instead of fixing the root cause requires:

1. **Explicit approval** from the human developer before implementation
2. **Clear explanation** of WHY this approach is needed
3. **Documentation** of the trade-offs

Examples that require approval:
- `suppressHydrationWarning` in React
- `eslint-disable` / `@ts-ignore` / `@ts-expect-error`
- Empty `catch` blocks that swallow errors
- `as any` type assertions
- Console warnings suppression

**Preferred approach**: Always fix the root cause first. Only use suppression as a last resort with explicit approval.

---

## Backend ORM Best Practices (MANDATORY)

When implementing database operations, **always prioritize**:
1. **Official ORM patterns** - Use sequelize-cli official approach
2. **Community best practices** - Well-established community patterns
3. **Custom implementation** - Only if no official pattern exists

### ⚠️ Database Modification Confirmation (CRITICAL)

**Before ANY database schema change** (migrations, model changes, table alterations), you MUST:

1. **Ask the human developer**: "專案是否已部署上線？(Is this project deployed to production?)"
2. **Based on the answer**:
   - **未部署 (Not deployed)**: May modify existing migrations, then use `db:reset`
   - **已部署 (Deployed)**: NEVER modify existing migrations; always create NEW migration files

This applies to:
- Creating new tables
- Adding/removing columns
- Changing column types or constraints
- Adding/removing indexes
- Any schema modifications

### Migrations & Seeders
- Use `sequelize-cli` for migrations and seeders
- **IMPORTANT**: sequelize-cli generates `.js` files by default. Convert to `.ts` with proper type annotations
- Location: `db/migrations/`, `db/seeders/`
- Commands: `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:reset`
- **Migration Modification Policy:**
  - **Early Development (Pre-production)**: 
    - Modify original migrations directly instead of creating new `addColumn` migrations
    - Add new columns to the original `createTable` migration
    - Run `db:reset` to apply changes
  - **Post-production**: Never modify executed migrations; create new migration files

---

## Project-Specific Rules

### Package Manager
- Use `pnpm` for all package operations

### i18n
- Use `next-intl` (default: `zh-tw`, supported: `zh-tw`, `en`)
- Call `setRequestLocale(locale)` in Server Components before `getTranslations`

### Next.js 16
- Middleware file is now `proxy.ts` (not `middleware.ts`)

### Database
- ORM: Sequelize with MySQL
- Database: `pos_switch_ai_agent_next`

---

## Full Documentation
- [AI Coding Rules (English)](docs/ai-coding-rules.md)
- [AI Coding Rules (繁體中文)](docs/ai-coding-rules.zh-tw.md)
- [Implementation Plan](docs/implementation_plan.md)
- [Task Progress](docs/task.md)
