# POS Switch AI Agent

通用 POS (Point of Sale) 系統，適用於各種業態（早餐店、飲料店、零售業等）。

*本專案主要用於測試AI Agent的開發能力，將學生時期的專題專案以AI Agent重現，並非商業用途*

**[English](./README.md)**

## 技術棧

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4
- **Database**: MySQL 8.0.33
- **ORM**: Sequelize
- **i18n**: next-intl (zh-tw / en)

## 開發指令

```bash
# 安裝依賴
pnpm install

# 開發模式
pnpm dev

# 建置
pnpm build

# 生產模式
pnpm start

# 程式碼檢查
pnpm lint
```

## 環境設定

複製 `.env.example` 為 `.env.local` 並設定資料庫連線資訊：

```bash
cp .env.example .env.local
```

## 專案結構

```
pos-switch-ai-agent/
├── app/                  # Next.js App Router
│   ├── [locale]/         # i18n pages
│   └── api/              # API Routes
├── components/           # React components
├── db/                   # Database (Sequelize)
│   ├── config/           # Database configuration
│   ├── models/           # Sequelize models
│   ├── migrations/       # Database migrations
│   └── seeders/          # Seed data
├── hooks/                # Custom React hooks
├── utils/                # 工具函數與模組
│   ├── classNames.ts     # Tailwind class merge
│   └── auth/             # 認證工具
├── types/                # TypeScript definitions
├── i18n/                 # Internationalization
└── public/               # Static files
```

## 功能特色

### 彈性結帳模式

- **先結帳 (Pre-pay)**: 點餐後立即付款
- **後結帳 (Post-pay)**: 先出餐，用餐完畢再結帳

### 訂單修改

- 訂單在草稿或進行中狀態可自由修改品項
- 支援追加、刪除、修改品項數量

### 權限系統

| 權限代碼 | 說明 |
|----------|------|
| `product_management` | 品項維護 |
| `checkout` | 結帳 |
| `order_history` | 歷史訂單查詢 |
| `statistics` | 統計資料閱覽 |

## 文件

- [實作計畫](./docs/implementation_plan.md)
- [開發進度](./docs/task.md)
- [資料庫 Schema (DBML)](./docs/database-schema.dbml) - 匯入至 [dbdiagram.io](https://dbdiagram.io)
- [API 文件](http://localhost:3000/zh-tw/api-docs) - Swagger UI

## License

MIT
