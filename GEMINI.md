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

### React Stable API Policy (⚠️ CRITICAL)
- **Prioritize React Stable APIs**, **avoid experimental syntax**, and **use proper hook selection**
- ✅ **React 19 Stable Hooks**: `useState`, `useReducer`, `useContext`, `useRef`, `useImperativeHandle`, `useEffect`, `useLayoutEffect`, `useInsertionEffect`, `useEffectEvent`, `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`, `useId`, `useSyncExternalStore`, `useDebugValue`, `useActionState`, `useFormStatus`, `useOptimistic`, `use`
- ✅ **Hook Selection Guidelines**:
  | Scenario | Use |
  |----------|-----|
  | Expensive calculations | `useMemo` |
  | Callbacks passed to children | `useCallback` |
  | Prevent re-renders | `memo` |
  | Access DOM / mutable values | `useRef` |
  | Complex state logic | `useReducer` |
  | Share state across components | `useContext` |
  | Visual sync (prevent flicker) | `useLayoutEffect` |
  | Form action state (React 19) | `useActionState` |
  | Optimistic updates (React 19) | `useOptimistic` |
  | Non-blocking UI updates | `useTransition` |
  | Reactive events inside effects | `useEffectEvent` |
- ❌ **Avoid**: React Compiler/Forget (experimental), any "Canary" or "Experimental" features, unstable_ prefixed APIs
- ⚠️ **Anti-patterns**:
  - DON'T use inline arrow functions in JSX when passing to memoized children → use `useCallback`
  - DON'T recalculate values on every render → use `useMemo`
  - DON'T use `useState` for values that don't need re-render → use `useRef`
- 📦 **RTK vs useContext** (when using Redux Toolkit):
  - **Use RTK**: Global app state, cross-page data, persisted state, RTK Query, state needing DevTools
  - **Use useContext**: Theme/i18n Provider, local component tree state, third-party Provider (React Query, SWR)

### useLayoutEffect vs useEffect
- Use `useLayoutEffect` when syncing props to state that affects **visual rendering** (sliders, position)
- Use `useEffect` for data fetching, subscriptions, timers
- `useLayoutEffect` runs synchronously before browser paint - avoid heavy computations

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

## No Scripts for Code Refactoring (⚠️ CRITICAL)

**ABSOLUTELY FORBIDDEN: Using automated scripts (sed, awk, powershell, batch scripts) to modify code files.**

### Why
- Scripts only change text, they don't understand context or imports
- 2026-01-23 incident: `sed` changed `React.FormEvent` → `FormEvent` but forgot imports → compilation errors

### ✅ Allowed
- Use AI tools: `replace_file_content`, `multi_replace_file_content`
- MUST verify imports are correct after every change

### ❌ Forbidden
- `sed`, `awk`, `perl`, `powershell -Command`, `find ... -exec`
- Any batch text processing

### Exception
If absolutely necessary:
1. Get explicit human approval FIRST
2. Show complete script for review
3. Explain why manual tools can't do it

### Remember
**Scripts are blind. AI should be intelligent.**

---

## Full Documentation
- [AI Coding Rules (English)](docs/ai-coding-rules.md)
- [AI Coding Rules (繁體中文)](docs/ai-coding-rules.zh-tw.md)
- [Implementation Plan](docs/implementation_plan.md)
- [Task Progress](docs/task.md)
