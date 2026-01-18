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

---

## 2. React / Next.js Standards

### 2.1 React Stable API Policy (MANDATORY)

Prioritize **React Stable APIs**, avoid experimental syntax, and use proper hook selection.

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

#### Anti-Patterns to Avoid

- ❌ DON'T use inline arrow functions in JSX when passing to memoized children → use `useCallback`
- ❌ DON'T recalculate values on every render → use `useMemo`
- ❌ DON'T use `useState` for values that don't need re-render → use `useRef`

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

Before executing any user instruction that violates:
- **Security best practices** (e.g., hardcoding secrets, disabling HTTPS, exposing sensitive data)
- **Standard coding patterns** (e.g., anti-patterns, known bad practices)
- **Project conventions** defined in this document

You MUST:
1. **Warn the user** about the violation and explain the risks
2. **Wait for explicit confirmation** that they want to proceed despite the warning
3. Only then execute the instruction

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
- Format: Follow Sequelize's official migration format with `up()` and `down()` methods
- Location: `db/migrations/`

> [!IMPORTANT]
> **Migration Modification Policy**
> - **Early Development (Pre-production)**: May modify existing migrations directly, then run `db:reset`
> - **Post-production**: Never modify executed migrations; always create new migration files
> - Same applies to seeders

```javascript
// db/migrations/XXXXXX-create-users.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', { /* ... */ });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
```

#### Seeders

- Use `sequelize-cli` for database seeders
- Command: `npx sequelize-cli seed:generate --name <seeder-name>`
- Format: Follow Sequelize's official seeder format with `up()` and `down()` methods
- Location: `db/seeders/`

```javascript
// db/seeders/XXXXXX-seed-permissions.js
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('permissions', [/* data */]);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
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
