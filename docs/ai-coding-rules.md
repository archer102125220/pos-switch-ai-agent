# AI Coding Rules

This document describes the coding rules and standards that AI assistants (e.g., Claude, Gemini) should follow when working on this project.

## 1. TypeScript Standards

### 1.1 Type Safety (MANDATORY)

- **NEVER use `any` type** - Use precise type definitions, generics, or `unknown` instead
- **Use `as unknown as TargetType`** for type assertions when necessary (double assertion)
- **NEVER use `as any`** - Always use `as unknown as TargetType` for safer assertions
- **Use inline type imports** - `import { useState, type ReactNode } from 'react'`

```typescript
// ❌ FORBIDDEN
function processData(data: any) { }
const element = document.getElementById('id') as any;

// ✅ REQUIRED
function processData<T extends { value: unknown }>(data: T) { }
const element = document.getElementById('id') as unknown as CustomElement;
```

### 1.2 Error/Warning Suppression Policy (CRITICAL)

Any code that **suppresses, hides, or bypasses errors/warnings** instead of fixing the root cause requires:

1. **Explicit approval** from the human developer before implementation
2. **Clear explanation** of WHY this approach is needed
3. **Documentation** of the trade-offs

#### Examples that require approval:

| Technique | Risk |
|-----------|------|
| `suppressHydrationWarning` | Hides SSR/CSR mismatch |
| `eslint-disable` / `@ts-ignore` / `@ts-expect-error` | Bypasses static analysis |
| Empty `catch` blocks | Swallows errors silently |
| `as any` type assertions | Breaks type safety |
| Console warnings suppression | Hides runtime issues |

**Preferred approach**: Always fix the root cause first. Only use suppression as a last resort with explicit approval.

---

## 2. React / Next.js Standards

### 2.1 React Stable API Policy (MANDATORY)

Prioritize **React Stable APIs**, avoid experimental syntax, and use proper hook selection.

**React 19 Stable Hooks**: `useState`, `useReducer`, `useContext`, `useRef`, `useImperativeHandle`, `useEffect`, `useLayoutEffect`, `useInsertionEffect`, `useEffectEvent`, `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`, `useId`, `useSyncExternalStore`, `useDebugValue`, `useActionState`, `useFormStatus`, `useOptimistic`, `use`

#### Hook Selection Guidelines

| Scenario | Hook |
|----------|------|
| Expensive calculations | `useMemo` |
| Callbacks passed to children | `useCallback` |
| Prevent unnecessary re-renders | `memo` |
| Access DOM / mutable values | `useRef` |
| Complex state logic | `useReducer` |
| Share state across components | `useContext` |
| Visual sync (prevent flicker) | `useLayoutEffect` |
| Form action state (React 19) | `useActionState` |
| Optimistic updates (React 19) | `useOptimistic` |
| Non-blocking UI updates | `useTransition` |
| Reactive events inside effects | `useEffectEvent` |

#### Anti-Patterns to Avoid

- ❌ DON'T use inline arrow functions in JSX when passing to memoized children → use `useCallback`
- ❌ DON'T recalculate values on every render → use `useMemo`
- ❌ DON'T use `useState` for values that don't need re-render → use `useRef`

#### RTK vs useContext (when using Redux Toolkit)

| Use RTK for | Use useContext for |
|-------------|-------------------|
| Global app state (user, cart, notifications) | Theme Provider (MUI ThemeContext) |
| Cross-page shared data | Locale/i18n (next-intl) |
| Persisted state | Local component tree state |
| Complex async data (RTK Query) | Third-party Provider (React Query, SWR) |
| State needing DevTools debugging | Component library internal state |

### 2.2 useLayoutEffect vs useEffect

- Use `useLayoutEffect` when syncing props to state that affects **visual rendering** (sliders, position)
- Use `useEffect` for data fetching, subscriptions, timers
- `useLayoutEffect` runs synchronously before browser paint - avoid heavy computations

### 2.3 Server Components vs Client Components (MANDATORY)

**Core Principle**: Default to Server Components, use Client Components only when needed.

#### When to use Server Components (default)

| Scenario | Reason |
|----------|--------|
| Data fetching | Reduces client bundle, faster load |
| Backend resources | Direct DB queries, file access |
| Sensitive data | API keys, tokens not exposed |
| Static content | Non-interactive UI |

#### When to use Client Components (`'use client'`)

| Scenario | Reason |
|----------|--------|
| Interactivity | onClick, onChange events |
| Hooks | useState, useEffect, useContext |
| Browser APIs | localStorage, window |
| Third-party client libs | Libraries that depend on window |

#### Best Practices

1. **Push `'use client'` to leaf components** - Don't mark entire pages as client
2. **Server fetches, Client renders** - Fetch data in Server Component, pass to Client
3. **Use children pattern** - Server can wrap Client which wraps Server via children

```tsx
// ✅ Good: Only the interactive part is a Client Component
// app/products/page.tsx (Server)
async function ProductsPage() {
  const products = await db.products.findAll();
  return (
    <div>
      {products.map(p => (
        <ProductCard key={p.id} product={p}>
          <AddToCartButton productId={p.id} /> {/* Client */}
        </ProductCard>
      ))}
    </div>
  );
}

// components/AddToCartButton.tsx (Client)
'use client';
export function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  return <button onClick={() => addToCart(productId)}>Add</button>;
}
```

---

## 3. Tailwind CSS Standards

### 3.1 Class Merge Utility

Always use the `classNames()` utility function from `@/utils/classNames` for conditional classes:

```tsx
import { classNames } from '@/utils/classNames';

<button className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-primary-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
  Button
</button>
```

---

## 4. Lint Disable Comments (CRITICAL)

- **NEVER** add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or similar comments without **explicit user instruction**
- When encountering lint warnings/errors:
  1. Report the warning to the user
  2. Wait for user's explicit instruction to add a disable comment
  3. Only then add the disable comment with proper justification

---

## 5. Security & Best Practices

### 5.1 Warning Policy for Risky Instructions

Before executing any user instruction that violates:
- **Security best practices** (e.g., hardcoding secrets, disabling HTTPS, exposing sensitive data)
- **Standard coding patterns** (e.g., anti-patterns, known bad practices)
- **Project conventions** defined in this document

You MUST:
1. **Warn the user** about the violation and explain the risks
2. **Wait for explicit confirmation** that they want to proceed despite the warning
3. Only then execute the instruction

### 5.2 No Scripts for Code Refactoring (CRITICAL)

**ABSOLUTELY FORBIDDEN: Using any automated scripts (sed, awk, powershell script, batch script, etc.) to directly modify code files.**

#### Reason

**Incident on 2026-01-23:**
- Used `sed` script to batch replace `React.FormEvent` → `FormEvent` and `React.ReactNode` → `ReactNode`
- Script only changed type names, **failed to add required import statements**
- Caused compilation errors in multiple files
- Required manual fix of all affected files one by one

#### Allowed Approaches

✅ **Manual modification using AI tools**
- `replace_file_content` - for single contiguous edits
- `multi_replace_file_content` - for multiple non-contiguous edits
- **MUST verify import statements are correct** for every change

#### Forbidden Approaches

❌ **Any form of script-based batch modification**
- `sed`, `awk`, `perl`, `powershell -Command`, `find ... -exec`
- Any text processing tool's batch replacement features

#### Exception Process

If script usage is **absolutely necessary**:
1. **MUST obtain explicit human developer approval first**
2. Must provide complete script content for review
3. Must explain why manual tools cannot accomplish the task
4. Only execute after developer approval

#### Consequences for Violation

Violation is considered a **CRITICAL ERROR** and requires:
1. Immediately stop all work
2. Manually fix all affected files
3. Verify all modifications are correct
4. Clearly document error cause and fix in commit message

#### Remember

**Scripts are blind. AI should be intelligent.**

Code modification requires understanding context, import dependencies, type systems, etc. These are beyond what scripts can handle.

---

## 6. Project-Specific Rules

### 6.1 Database

- ORM: Sequelize with MySQL
- Database name includes framework suffix (e.g., `pos_switch_ai_agent_next`) for multi-framework experiment differentiation

### 6.2 Backend ORM Best Practices (MANDATORY)

When implementing database operations, **always prioritize**:

1. **Official ORM patterns** - Use the ORM package's documented approach
2. **Community best practices** - If official docs are insufficient, follow well-established community patterns
3. **Custom implementation** - Only write custom code if no official or community pattern exists

#### Migrations

- Use `sequelize-cli` for database migrations
- Command: `npx sequelize-cli migration:generate --name <migration-name>`
- **IMPORTANT**: sequelize-cli generates `.js` files by default. You MUST convert them to `.ts` files:
  1. Change file extension from `.js` to `.ts`
  2. Add TypeScript imports and type annotations (see example below)
- Format: Follow the TypeScript migration format with `up()` and `down()` exported functions
- Location: `db/migrations/`

> [!WARNING]
> **Database Modification Confirmation (CRITICAL)**
> 
> Before ANY database schema change (migrations, model changes, table alterations), you MUST:
> 1. **Ask the developer**: "Is this project deployed to production?"
> 2. **Based on the answer**:
>    - **Not deployed**: May modify existing migrations, then use `db:reset`
>    - **Deployed**: NEVER modify existing migrations; always create NEW migration files
>
> This applies to: creating tables, adding/removing columns, changing types, adding indexes, etc.

> [!IMPORTANT]
> **Migration Modification Policy**
> - **Early Development (Pre-production)**: 
>   - Modify original migrations directly instead of creating new `addColumn` migrations
>   - Add new columns to the original `createTable` migration
>   - Run `db:reset` to apply changes
> - **Post-production**: Never modify executed migrations; always create new migration files
> - Same applies to seeders

```typescript
// db/migrations/XXXXXX-create-users.ts
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.createTable('users', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // ... other columns
  });
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.dropTable('users');
}
```

#### Seeders

- Use `sequelize-cli` for database seeders
- Command: `npx sequelize-cli seed:generate --name <seeder-name>`
- **IMPORTANT**: sequelize-cli generates `.js` files by default. You MUST convert them to `.ts` files (same as migrations)
- Format: Follow the TypeScript seeder format with `up()` and `down()` exported functions
- Location: `db/seeders/`

```typescript
// db/seeders/XXXXXX-seed-permissions.ts
import { QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.bulkInsert('permissions', [/* data */]);
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.bulkDelete('permissions', null, {});
}
```

### 6.3 Package Manager

- Use `pnpm` for all package operations
- Commands: `pnpm add`, `pnpm remove`, `pnpm dev`, `pnpm build`

### 6.4 Internationalization (i18n)

- Use `next-intl` for internationalization
- Default locale: `zh-tw` (Traditional Chinese)
- Supported locales: `zh-tw`, `en`

### 6.5 API Design

- RESTful API design
- Use Next.js App Router API Routes (`app/api/`)
- Response format: JSON with consistent structure

### 6.6 Permission System

Four permission types:
| Permission Code | Description |
|----------------|-------------|
| `product_management` | Product and category CRUD |
| `checkout` | POS checkout operations |
| `order_history` | View order history |
| `statistics` | View sales reports and statistics |

---



## 7. File Organization

```
pos-switch-ai-agent/
├── app/                  # Next.js App Router
│   ├── [locale]/         # i18n pages
│   └── api/              # API Routes
├── components/           # React components
│   ├── ui/               # Base UI components
│   ├── POS/              # POS-specific components
│   └── Admin/            # Admin dashboard components
├── db/                   # Database (Sequelize)
│   ├── config/           # Database configuration
│   ├── models/           # Sequelize models
│   ├── migrations/       # Database migrations
│   └── seeders/          # Seed data
├── hooks/                # Custom React hooks
├── utils/                # Utility functions and modules
│   ├── classNames.ts     # Tailwind class merge
│   └── auth/             # Authentication (JWT, cookies)
├── types/                # TypeScript definitions
├── i18n/                 # Internationalization
└── docs/                 # Documentation
```
