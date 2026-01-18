# POS Switch AI Agent

A universal POS (Point of Sale) system suitable for various business types (breakfast shops, beverage shops, retail, etc.).

*This project is primarily used to test AI Agent development capabilities, recreating a student-era project using AI Agent, and is not for commercial use.*

**[繁體中文](./README.zh-TW.md)**

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4
- **Database**: MySQL 8.0.33
- **ORM**: Sequelize
- **i18n**: next-intl (zh-tw / en)

## Development Commands

```bash
# Install dependencies
pnpm install

# Development mode
pnpm dev

# Build
pnpm build

# Production mode
pnpm start

# Lint check
pnpm lint

# Database migrations
pnpm db:migrate

# Database seeders
pnpm db:seed

# Reset database (undo + migrate + seed)
pnpm db:reset
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure your database connection:

```bash
cp .env.example .env.local
```

## Project Structure

```
pos-switch-ai-agent/
├── app/                  # Next.js App Router
│   ├── [locale]/         # i18n pages
│   └── api/              # API Routes
├── components/           # React components
├── db/                   # Database (Sequelize)
│   ├── config/           # Database configuration
│   ├── models/           # Sequelize models (TypeScript)
│   ├── migrations/       # Database migrations (TypeScript)
│   └── seeders/          # Seed data (TypeScript)
├── hooks/                # Custom React hooks
├── utils/                # Utility functions and modules
│   ├── classNames.ts     # Tailwind class merge
│   └── auth/             # Authentication utilities
├── types/                # TypeScript definitions
├── i18n/                 # Internationalization
└── public/               # Static files
```

## Features

### Flexible Checkout Modes

- **Pre-pay**: Pay immediately after ordering
- **Post-pay**: Serve first, pay after dining

### Order Modification

- Orders in draft or in-progress status can be freely modified
- Supports adding, removing, and changing item quantities

### Permission System

| Permission Code | Description |
|-----------------|-------------|
| `product_management` | Product and category CRUD |
| `checkout` | POS checkout operations |
| `order_history` | View order history |
| `statistics` | View sales reports |

### Default Credentials

- **Email**: admin@pos-switch.com
- **Password**: admin123

## Documentation

- [Implementation Plan](./docs/implementation_plan.md)
- [Development Progress](./docs/task.md)
- [Database Schema (DBML)](./docs/database-schema.dbml) - Import to [dbdiagram.io](https://dbdiagram.io)
- [API Documentation](http://localhost:3000/zh-tw/api-docs) - Swagger UI
- [AI Coding Rules (English)](./docs/ai-coding-rules.md)
- [AI Coding Rules (繁體中文)](./docs/ai-coding-rules.zh-tw.md)

## License

MIT
