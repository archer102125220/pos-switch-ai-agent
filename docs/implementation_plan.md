# POS Switch AI Agent - Implementation Plan

## Overview

建立一個通用的 POS (Point of Sale) 系統，適用於各種業態（早餐店、飲料店、零售業等）。

### 技術棧
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Package Manager**: pnpm
- **Styling**: Tailwind CSS v4
- **Database**: MySQL 8.0.33
- **ORM**: Sequelize
- **i18n**: next-intl (支援 zh-tw / en)
- **State Management**: React Context / Redux Toolkit (視需求)

---

## 已確認資訊

### MySQL 連線資訊

| 項目 | 值 |
|------|-----|
| Host | localhost |
| Port | 3306 |
| Version | 8.0.33 |
| Username | root |
| Password | 123456789 |
| Database | `pos_switch_ai_agent` (將新建) |

### 專案名稱

- **資料夾名稱**: `pos-switch-ai-agent` (kebab-case)
- **npm package name**: `pos-switch-ai-agent`
- **專案位置**: `c:\Users\User\Desktop\code\pos-switch-ai-agent\`

### 多語系支援

- ✅ 支援 i18n (next-intl)
- 預設語言: `zh-tw` (繁體中文)
- 支援語言: `zh-tw`, `en`

### 權限系統

| 權限代碼 | 名稱 | 說明 |
|----------|------|------|
| `product_management` | 品項維護 | 新增/編輯/刪除商品與分類 |
| `checkout` | 結帳 | 操作 POS 結帳功能 |
| `order_history` | 歷史訂單查詢 | 檢視過往訂單記錄 |
| `statistics` | 統計資料閱覽 | 檢視銷售報表與統計 |

---

## 結帳流程設計

### 彈性結帳模式

系統支援兩種結帳流程，可依店家需求設定：

| 模式 | 說明 | 適用場景 |
|------|------|----------|
| **先結帳 (Pre-pay)** | 點餐完成後立即結帳付款 | 飲料店、速食店、便利商店 |
| **後結帳 (Post-pay)** | 點餐後先出餐，用餐完畢再結帳 | 餐廳、咖啡廳、早餐店 |

### 訂單生命週期

```
                    ┌─────────────┐
                    │   draft     │  ← 草稿狀態 (購物車)
                    │  (草稿)     │     可自由新增/修改/刪除品項
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │  Pre-pay Mode   │       │  Post-pay Mode  │
    │    先結帳模式    │       │    後結帳模式    │
    └────────┬────────┘       └────────┬────────┘
             │                         │
             ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │    pending      │       │   in_progress   │  ← 進行中
    │   (待付款)      │       │    (製作中)      │     仍可修改訂單
    └────────┬────────┘       └────────┬────────┘
             │                         │
             │ [付款完成]               │ [餐點送達]
             ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐
    │   completed     │       │    pending      │  ← 待結帳
    │    (已完成)     │       │   (待付款)      │
    └─────────────────┘       └────────┬────────┘
                                       │ [付款完成]
                                       ▼
                              ┌─────────────────┐
                              │   completed     │
                              │    (已完成)     │
                              └─────────────────┘
```

### 訂單狀態定義

| 狀態 | 代碼 | 說明 | 可執行操作 |
|------|------|------|------------|
| 草稿 | `draft` | 購物車狀態，尚未送出 | 新增/修改/刪除品項 |
| 進行中 | `in_progress` | 訂單已送出，製作中 (後結帳) | 追加/刪除品項 |
| 待付款 | `pending` | 等待付款 | 付款 |
| 已完成 | `completed` | 訂單已結帳完成 | 退款 (需權限) |
| 已取消 | `cancelled` | 訂單已取消 | - |
| 已退款 | `refunded` | 訂單已退款 | - |

### 訂單修改規則

> [!IMPORTANT]
> 訂單在 `draft` 和 `in_progress` 狀態下可自由修改品項

```typescript
// 可修改狀態
const EDITABLE_STATUSES = ['draft', 'in_progress'] as const;

// 訂單修改操作
interface OrderModification {
  addItem: (productId: number, quantity: number, notes?: string) => void;
  updateItemQuantity: (orderItemId: number, quantity: number) => void;
  removeItem: (orderItemId: number) => void;
  updateItemNotes: (orderItemId: number, notes: string) => void;
}
```

---

## Proposed Changes

### Project Structure

```
c:\Users\User\Desktop\code\pos-switch-ai-agent\
├── .agent/                    # Agent rules
│   └── rules/
├── .cursor/                   # Cursor rules
│   └── rules/
├── app/
│   ├── [locale]/              # i18n support
│   │   ├── layout.tsx
│   │   ├── page.tsx           # 首頁/導航
│   │   ├── pos/               # POS 結帳畫面
│   │   │   └── page.tsx
│   │   ├── admin/             # 管理後台
│   │   │   ├── layout.tsx
│   │   │   ├── products/      # 品項維護
│   │   │   ├── categories/    # 分類維護
│   │   │   ├── orders/        # 歷史訂單
│   │   │   ├── reports/       # 統計報表
│   │   │   └── settings/      # 系統設定 (結帳模式)
│   │   └── login/             # 登入頁面
│   ├── api/                   # API Routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   │   ├── route.ts       # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts   # GET, PUT, DELETE
│   │   │       └── items/
│   │   │           └── route.ts  # POST (add item), PUT, DELETE
│   │   ├── payments/
│   │   ├── reports/
│   │   └── settings/
│   ├── globals.css            # Tailwind 全域樣式
│   └── layout.tsx             # Root layout
├── components/
│   ├── POS/                   # POS 相關元件
│   │   ├── ProductGrid.tsx
│   │   ├── Cart.tsx
│   │   ├── OrderPanel.tsx     # 訂單面板 (含修改功能)
│   │   ├── PaymentModal.tsx
│   │   ├── Receipt.tsx
│   │   └── ActiveOrders.tsx   # 進行中訂單列表 (後結帳用)
│   ├── Admin/                 # 管理後台元件
│   ├── ui/                    # 通用 UI 元件 (Button, Card, Modal...)
│   └── common/                # 共用元件
├── db/
│   ├── config/
│   │   └── database.ts        # Sequelize 設定
│   ├── models/
│   │   ├── index.ts           # Model associations
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Order.ts
│   │   ├── OrderItem.ts
│   │   ├── Payment.ts
│   │   ├── Store.ts
│   │   ├── User.ts
│   │   ├── Role.ts
│   │   ├── Permission.ts
│   │   └── Setting.ts         # 系統設定
│   ├── migrations/
│   └── seeders/
├── hooks/                     # Custom React hooks
│   ├── useCart.ts             # 購物車狀態
│   ├── useOrder.ts            # 訂單操作
│   └── useActiveOrders.ts     # 進行中訂單 (後結帳)
├── lib/                       # Utility functions
│   └── utils.ts               # cn() helper for Tailwind
├── types/                     # TypeScript 型別定義
├── i18n/
│   ├── locales/
│   │   ├── zh-tw.json
│   │   └── en.json
│   ├── navigation.ts
│   ├── request.ts
│   └── routing.ts
├── public/
├── CLAUDE.md
├── GEMINI.md
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts         # Tailwind 設定
├── postcss.config.mjs         # PostCSS 設定
├── tsconfig.json
└── .env.local
```

---

### Tailwind CSS 設定

#### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

#### lib/utils.ts (Tailwind class merge helper)

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

### Database Schema

#### [NEW] db/models/Setting.ts

```typescript
// 系統設定
interface SettingAttributes {
  id: number;
  storeId?: number;       // 門市專屬設定 (null = 全域)
  key: string;            // 設定鍵
  value: string;          // 設定值 (JSON string)
  createdAt: Date;
  updatedAt: Date;
}

// 預設設定
const defaultSettings = {
  checkout_mode: 'pre_pay',  // 'pre_pay' | 'post_pay'
  allow_order_modification: true,
  tax_rate: 0,               // 稅率 %
  receipt_header: '',        // 收據抬頭
  receipt_footer: '',        // 收據頁尾
};
```

#### [UPDATED] db/models/Order.ts

```typescript
// 訂單
interface OrderAttributes {
  id: number;
  orderNumber: string;    // 訂單編號 (自動產生)
  storeId?: number;       // 門市 ID
  userId?: number;        // 收銀員 ID
  tableNumber?: string;   // 桌號 (後結帳用)
  subtotal: number;       // 小計
  tax: number;            // 稅額
  discount: number;       // 折扣
  total: number;          // 總計
  status: 'draft' | 'in_progress' | 'pending' | 'completed' | 'cancelled' | 'refunded';
  checkoutMode: 'pre_pay' | 'post_pay';  // 此訂單的結帳模式
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/Permission.ts

```typescript
// 權限
interface PermissionAttributes {
  id: number;
  code: 'product_management' | 'checkout' | 'order_history' | 'statistics';
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/Role.ts

```typescript
// 角色
interface RoleAttributes {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/User.ts

```typescript
// 使用者
interface UserAttributes {
  id: number;
  storeId?: number;
  roleId: number;
  email: string;
  passwordHash: string;
  name: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/Category.ts

```typescript
// 商品分類
interface CategoryAttributes {
  id: number;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/Product.ts

```typescript
// 商品
interface ProductAttributes {
  id: number;
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  barcode?: string;
  imageUrl?: string;
  stock?: number;
  trackStock: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/OrderItem.ts

```typescript
// 訂單明細
interface OrderItemAttributes {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/Payment.ts

```typescript
// 付款記錄
interface PaymentAttributes {
  id: number;
  orderId: number;
  method: 'cash' | 'credit_card' | 'mobile_pay' | 'other';
  amount: number;
  receivedAmount?: number;
  change?: number;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}
```

#### [NEW] db/models/Store.ts

```typescript
// 門市
interface StoreAttributes {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 預設角色與權限

| 角色 | product_management | checkout | order_history | statistics |
|------|--------------------|----------|---------------|------------|
| 管理員 (Admin) | ✅ | ✅ | ✅ | ✅ |
| 店長 (Manager) | ✅ | ✅ | ✅ | ✅ |
| 收銀員 (Cashier) | ❌ | ✅ | ✅ | ❌ |
| 查帳員 (Auditor) | ❌ | ❌ | ✅ | ✅ |

---

### API Routes

| Method | Endpoint | 權限需求 | Description |
|--------|----------|----------|-------------|
| POST | `/api/auth/login` | - | 登入 |
| POST | `/api/auth/logout` | - | 登出 |
| GET | `/api/auth/me` | - | 取得當前使用者 |
| GET | `/api/products` | checkout | 取得商品列表 |
| POST | `/api/products` | product_management | 新增商品 |
| PUT | `/api/products/[id]` | product_management | 更新商品 |
| DELETE | `/api/products/[id]` | product_management | 刪除商品 |
| GET | `/api/categories` | checkout | 取得分類列表 |
| POST | `/api/categories` | product_management | 新增分類 |
| PUT | `/api/categories/[id]` | product_management | 更新分類 |
| DELETE | `/api/categories/[id]` | product_management | 刪除分類 |
| GET | `/api/orders` | order_history | 取得訂單列表 |
| GET | `/api/orders/active` | checkout | 取得進行中訂單 |
| GET | `/api/orders/[id]` | checkout | 取得訂單明細 |
| POST | `/api/orders` | checkout | 建立訂單 |
| PUT | `/api/orders/[id]` | checkout | 更新訂單 |
| PUT | `/api/orders/[id]/status` | checkout | 更新訂單狀態 |
| POST | `/api/orders/[id]/items` | checkout | 追加訂單品項 |
| PUT | `/api/orders/[id]/items/[itemId]` | checkout | 修改訂單品項 |
| DELETE | `/api/orders/[id]/items/[itemId]` | checkout | 刪除訂單品項 |
| POST | `/api/payments` | checkout | 處理付款 |
| GET | `/api/reports/daily` | statistics | 日報表 |
| GET | `/api/reports/products` | statistics | 商品銷售報表 |
| GET | `/api/settings` | - | 取得系統設定 |
| PUT | `/api/settings` | product_management | 更新系統設定 |

---

### Frontend UI - 使用 Tailwind CSS

#### UI 元件範例

```tsx
// components/ui/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md',
  children,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
          'bg-danger text-white hover:bg-red-600 focus:ring-red-500': variant === 'danger',
          'bg-transparent hover:bg-gray-100': variant === 'ghost',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

#### POS 主畫面結構

```tsx
// app/[locale]/pos/page.tsx
export default function POSPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* 左側：商品區 */}
      <div className="flex-1 flex flex-col">
        {/* 分類 Tab */}
        <div className="flex gap-2 p-4 bg-white border-b overflow-x-auto">
          <button className="px-4 py-2 rounded-lg bg-primary-600 text-white">
            全部
          </button>
          <button className="px-4 py-2 rounded-lg hover:bg-gray-100">
            飲料
          </button>
          {/* ... */}
        </div>
        
        {/* 商品網格 */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="grid grid-cols-4 gap-4">
            {/* ProductCard */}
          </div>
        </div>
      </div>

      {/* 右側：購物車 */}
      <div className="w-96 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">購物車</h2>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {/* Cart items */}
        </div>
        
        <div className="p-4 border-t space-y-2">
          <div className="flex justify-between text-lg font-bold">
            <span>總計</span>
            <span>$95</span>
          </div>
          <button className="w-full py-3 bg-primary-600 text-white rounded-lg text-lg font-bold hover:bg-primary-700">
            結帳
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Verification Plan

### Automated Tests

1. **Database Connection Test**
   ```bash
   pnpm test:db
   ```

2. **API Endpoint Tests**
   ```bash
   pnpm test:api
   ```

3. **Build Verification**
   ```bash
   pnpm build
   ```

### Manual Verification

1. 啟動開發伺服器，確認首頁載入正常
2. 測試登入功能與權限驗證
3. 測試先結帳流程 (Pre-pay)
4. 測試後結帳流程 (Post-pay)
5. 測試訂單修改功能（追加/刪除品項）
6. 檢視訂單記錄與報表

---

## Implementation Order

1. **Phase 1: 專案初始化**
   - 建立 Next.js 專案 (pnpm create next-app --tailwind)
   - 設定 Tailwind CSS
   - 設定 Sequelize + MySQL 連線
   - 設定 i18n (next-intl)
   - 建立資料庫 Models

2. **Phase 2: 權限系統**
   - 建立 Permission/Role/User Models
   - 建立登入 API
   - 建立權限驗證 middleware

3. **Phase 3: 商品 API**
   - 商品 CRUD API
   - 分類 CRUD API

4. **Phase 4: 訂單 API**
   - 訂單 CRUD API
   - 訂單品項修改 API
   - 系統設定 API (結帳模式)

5. **Phase 5: POS 前端**
   - UI 基礎元件 (Button, Card, Modal)
   - POS 主畫面 (雙模式切換)
   - 購物車功能
   - 訂單修改功能
   - 結帳流程

6. **Phase 6: 管理後台**
   - 商品管理頁面
   - 訂單查詢頁面
   - 報表功能
   - 系統設定頁面
