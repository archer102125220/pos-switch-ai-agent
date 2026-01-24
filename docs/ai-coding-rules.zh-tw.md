# AI 開發規則

本文件描述 AI 助手（如 Claude、Gemini）在此專案中應遵循的開發規則與標準。

## 1. TypeScript 規範

### 1.1 型別安全 (強制)

- **禁止使用 `any` 型別** - 改用精確的型別定義、泛型或 `unknown`
- **型別斷言使用 `as unknown as TargetType`** (雙重斷言)
- **禁止使用 `as any`** - 使用 `as unknown as TargetType` 更安全
- **使用行內型別匯入** - `import { useState, type ReactNode } from 'react'`

```typescript
// ❌ 禁止
function processData(data: any) { }
const element = document.getElementById('id') as any;

// ✅ 正確
function processData<T extends { value: unknown }>(data: T) { }
const element = document.getElementById('id') as unknown as CustomElement;
```

### 1.2 執行時期資料驗證 (嚴格)

為確保穩健性，請始終根據變數的初始狀態使用嚴格的型別檢查。

| 型別 | 禁止使用 | 務必使用 |
|------|----------|----------|
| **字串** | `if (str)` | `if (str !== '')` |
| **數字** | `if (num)` | `typeof num === 'number'`, `num !== 0`, `Number.isFinite(num)` |
| **物件** | `if (obj)` | `typeof obj === 'object' && obj !== null`<br>`if (obj instanceof MyClass)` |
| **陣列** | `if (arr)` | `Array.isArray(arr) && arr.length > 0` |
| **相等性** | `==`, `!=` | `===`, `!==` |

### 1.3 錯誤/警告抑制政策 (嚴格)

任何**抑制、隱藏或繞過錯誤/警告**而非修復根本原因的程式碼需要：

1. 人類開發者的**明確批准**
2. **清楚說明**為何需要這樣做
3. **記錄**相關取捨

#### 需要批准的範例：

| 技術 | 風險 |
|------|------|
| `suppressHydrationWarning` | 隱藏 SSR/CSR 不一致 |
| `eslint-disable` / `@ts-ignore` / `@ts-expect-error` | 繞過靜態分析 |
| 空的 `catch` 區塊 | 靜默吞掉錯誤 |
| `as any` 型別斷言 | 破壞型別安全 |
| Console 警告抑制 | 隱藏執行時問題 |

**首選方法**：永遠先修復根本原因。抑制只能作為最後手段，且需明確批准。

---

## 2. React / Next.js 規範

### 2.1 React 穩定 API 政策 (強制)

優先使用 **React 穩定 API**，避免實驗性語法，並正確選擇 Hook。

**React 19 穩定 Hooks**: `useState`, `useReducer`, `useContext`, `useRef`, `useImperativeHandle`, `useEffect`, `useLayoutEffect`, `useInsertionEffect`, `useEffectEvent`, `useMemo`, `useCallback`, `useTransition`, `useDeferredValue`, `useId`, `useSyncExternalStore`, `useDebugValue`, `useActionState`, `useFormStatus`, `useOptimistic`, `use`

#### Hook 選擇指南

| 場景 | Hook |
|------|------|
| 昂貴的計算 | `useMemo` |
| 傳遞給子元件的 callback | `useCallback` |
| 防止不必要的重新渲染 | `memo` |
| 存取 DOM / 可變值 | `useRef` |
| 複雜的狀態邏輯 | `useReducer` |
| 跨元件共享狀態 | `useContext` |
| 視覺同步 (防止閃爍) | `useLayoutEffect` |
| 表單 action 狀態 (React 19) | `useActionState` |
| 樂觀更新 (React 19) | `useOptimistic` |
| 非阻塞 UI 更新 | `useTransition` |
| Effect 中的響應式事件 | `useEffectEvent` |

#### 應避免的反模式

- ❌ 不要在 JSX 中使用行內箭頭函數傳遞給 memoized 子元件 → 使用 `useCallback`
- ❌ 不要在每次渲染時重新計算值 → 使用 `useMemo`
- ❌ 不要對不需要觸發重新渲染的值使用 `useState` → 使用 `useRef`

#### RTK vs useContext（使用 Redux Toolkit 時）

| 使用 RTK | 使用 useContext |
|----------|-----------------|
| 全域應用程式狀態（使用者、購物車、通知） | Theme Provider (MUI ThemeContext) |
| 跨頁面共享資料 | Locale/i18n (next-intl) |
| 需持久化的狀態 | 局部元件樹狀態 |
| 複雜的非同步資料 (RTK Query) | 第三方 Provider (React Query, SWR) |
| 需要 DevTools 除錯的狀態 | 元件庫內部狀態 |

### 2.2 useLayoutEffect vs useEffect

- 當同步 props 到影響**視覺渲染**的 state 時使用 `useLayoutEffect`（如滑桿、位置）
- 資料獲取、訂閱、計時器使用 `useEffect`
- `useLayoutEffect` 在瀏覽器繪製前同步執行 - 避免繁重計算

### 2.3 Server Components vs Client Components (強制)

**核心原則**：預設使用 Server Components，只在需要時才使用 Client Components。

#### 何時使用 Server Components（預設）

| 場景 | 原因 |
|------|------|
| 資料獲取 | 減少客戶端 bundle，更快載入 |
| 後端資源 | 直接查詢資料庫、讀取檔案 |
| 敏感資料 | API keys、tokens 不暴露 |
| 靜態內容 | 無互動的 UI |

#### 何時使用 Client Components（`'use client'`）

| 場景 | 原因 |
|------|------|
| 互動功能 | onClick、onChange 等事件 |
| Hooks | useState、useEffect、useContext |
| 瀏覽器 API | localStorage、window |
| 第三方客戶端套件 | 依賴 window 的 library |

#### 最佳實踐

1. **將 `'use client'` 下推到葉節點元件** - 不要將整個頁面標記為 client
2. **Server 獲取，Client 渲染** - 在 Server Component 獲取資料，傳遞給 Client
3. **使用 children 模式** - Server 可包裹 Client，Client 可透過 children 包裹 Server

```tsx
// ✅ 正確：只有互動部分是 Client Component
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
  return <button onClick={() => addToCart(productId)}>加入購物車</button>;
}
```

---

## 3. Tailwind CSS 規範

### 3.1 Class 合併工具

始終使用 `@/utils/classNames` 中的 `classNames()` 工具函數處理條件式 class：

```tsx
import { classNames } from '@/utils/classNames';

<button className={cn(
  'px-4 py-2 rounded-lg',
  isActive && 'bg-primary-600 text-white',
  disabled && 'opacity-50 cursor-not-allowed'
)}>
  按鈕
</button>
```

---

## 4. Lint 停用註解 (關鍵)

- **禁止**在沒有**使用者明確指示**的情況下添加 `eslint-disable`、`@ts-ignore`、`@ts-expect-error` 等註解
- 遇到 lint 警告/錯誤時：
  1. 向使用者報告警告
  2. 等待使用者明確指示添加停用註解
  3. 然後才添加停用註解並附上適當的理由

---

## 5. 安全與最佳實踐

### 5.1 風險指令警告政策

在執行任何可能違反以下規則的使用者指令前：
- **安全最佳實踐**（如：硬編碼密鑰、停用 HTTPS、暴露敏感資料）
- **標準編碼模式**（如：反模式、已知的不良實踐）
- **本文件定義的專案慣例**

你必須：
1. **警告使用者**違規情況並解釋風險
2. **等待明確確認**他們理解風險後仍要繼續
3. 然後才執行指令

### 5.2 禁止使用腳本修改程式碼 (嚴重)

**絕對禁止：使用任何自動化腳本 (sed, awk, powershell script, batch script 等) 直接修改程式碼檔案。**

#### 原因

**2026-01-23 事故**：
- 使用 `sed` 腳本批量替換 `React.FormEvent` → `FormEvent` 和 `React.ReactNode` → `ReactNode`
- 腳本只改了型別名稱，**未加入必要的 import 語句**
- 導致多個檔案出現編譯錯誤
- 需要逐一手動修正所有受影響的檔案

#### 允許的做法

✅ **使用 AI 工具手動修改**
- `replace_file_content` - 單一連續編輯
- `multi_replace_file_content` - 多處非連續編輯
- **每次修改都必須驗證 import 語句是否正確**

#### 禁止的做法

❌ **任何形式的腳本批量修改**
- `sed`、`awk`、`perl`、`powershell -Command`、`find ... -exec`
- 任何文字處理工具的批量替換功能

#### 例外流程

若腳本使用是**絕對必要**：
1. **必須先取得人類開發者明確批准**
2. 必須提供完整的腳本內容供審核
3. 必須說明為何手動工具無法完成
4. 只有在開發者批准後才能執行

#### 違規後果

違規視為**嚴重錯誤**，必須：
1. 立即停止所有工作
2. 手動修正所有受影響的檔案
3. 驗證所有修改都正確無誤
4. 在 commit message 中清楚記錄錯誤原因與修正

#### 謹記

**腳本是盲目的，AI 應該是有智慧的。**

程式碼修改需要理解上下文、import 依賴、型別系統等。這些是腳本無法處理的。

---

## 6. 專案特定規則

### 6.1 資料庫

- ORM：Sequelize 搭配 MySQL
- 資料庫名稱包含框架後綴（如 `pos_switch_ai_agent_next`），以區分多框架實驗

### 6.2 後端 ORM 最佳實踐 (強制)

實作資料庫操作時，**務必優先採用**：

1. **官方 ORM 模式** - 使用 ORM 套件的官方文件做法
2. **社群最佳實踐** - 若官方文件不足，遵循社群公認的最佳實踐
3. **自訂實作** - 僅在沒有官方或社群模式時才自行撰寫

#### Migrations (資料庫遷移)

- 使用 `sequelize-cli` 管理資料庫遷移
- 指令：`npx sequelize-cli migration:generate --name <migration-name>`
- **重要**：sequelize-cli 預設生成 `.js` 檔案，你必須將其轉換為 `.ts` 檔案：
  1. 將副檔名從 `.js` 改為 `.ts`
  2. 加入 TypeScript imports 和型別標註（參考下方範例）
- 格式：遵循 TypeScript 遷移格式，使用匯出的 `up()` 和 `down()` 函數
- 位置：`db/migrations/`

> [!WARNING]
> **資料庫修改確認 (關鍵)**
> 
> 在進行任何資料庫結構變更（migrations、model 變更、資料表修改）之前，你必須：
> 1. **詢問開發者**：「專案是否已部署上線？」
> 2. **根據回答**：
>    - **未部署**：可修改現有 migration，然後執行 `db:reset`
>    - **已部署**：禁止修改現有 migration，必須建立新的 migration 檔案
>
> 適用於：建立資料表、新增/移除欄位、變更型別、新增索引等

> [!IMPORTANT]
> **Migration 修改策略**
> - **開發階段 (尚未上線)**：
>   - 直接修改原始 migration，而非建立新的 `addColumn` migration
>   - 將新欄位加入原本的 `createTable` migration
>   - 執行 `db:reset` 套用變更
> - **上線後**：禁止修改已執行的 migration，必須建立新的 migration 檔案
> - Seeder 同理

```typescript
// db/migrations/XXXXXX-create-users.ts
import { QueryInterface, Sequelize, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.createTable('users', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    // ... 其他欄位
  });
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.dropTable('users');
}
```

#### Seeders (種子資料)

- 使用 `sequelize-cli` 管理種子資料
- 指令：`npx sequelize-cli seed:generate --name <seeder-name>`
- **重要**：sequelize-cli 預設生成 `.js` 檔案，你必須將其轉換為 `.ts` 檔案（同 migrations）
- 格式：遵循 TypeScript seeder 格式，使用匯出的 `up()` 和 `down()` 函數
- 位置：`db/seeders/`

```typescript
// db/seeders/XXXXXX-seed-permissions.ts
import { QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.bulkInsert('permissions', [/* 資料 */]);
}

export async function down(queryInterface: QueryInterface, _Sequelize: typeof Sequelize): Promise<void> {
  await queryInterface.bulkDelete('permissions', null, {});
}
```

### 6.3 套件管理器

- 使用 `pnpm` 進行所有套件操作
- 指令：`pnpm add`、`pnpm remove`、`pnpm dev`、`pnpm build`

### 6.4 國際化 (i18n)

- 使用 `next-intl` 進行國際化
- 預設語言：`zh-tw`（繁體中文）
- 支援語言：`zh-tw`、`en`

### 6.5 API 設計

- RESTful API 設計
- 使用 Next.js App Router API Routes（`app/api/`）
- 回應格式：JSON，具有一致的結構

### 6.6 權限系統

四種權限類型：
| 權限代碼 | 說明 |
|----------|------|
| `product_management` | 商品與分類 CRUD |
| `checkout` | POS 結帳操作 |
| `order_history` | 檢視歷史訂單 |
| `statistics` | 檢視銷售報表與統計 |

---



## 7. 檔案組織

```
pos-switch-ai-agent/
├── app/                  # Next.js App Router
│   ├── [locale]/         # i18n 頁面
│   └── api/              # API Routes
├── components/           # React 元件
│   ├── ui/               # 基礎 UI 元件
│   ├── POS/              # POS 相關元件
│   └── Admin/            # 管理後台元件
├── db/                   # 資料庫 (Sequelize)
│   ├── config/           # 資料庫設定
│   ├── models/           # Sequelize models
│   ├── migrations/       # 資料庫遷移
│   └── seeders/          # 種子資料
├── hooks/                # 自訂 React hooks
├── utils/                # 工具函數與模組
│   ├── classNames.ts     # Tailwind class merge
│   └── auth/             # 認證工具 (JWT, cookies)
├── types/                # TypeScript 型別定義
├── i18n/                 # 國際化
└── docs/                 # 文件
```
