# POS Switch AI Agent - 開發進度

## 當前階段: Phase 7 - 管理後台

### Phase 1: 專案初始化 ✅
- [x] 建立 Next.js 專案 (pnpm create next-app --tailwind)
- [x] 安裝基礎套件 (sequelize, mysql2, clsx, tailwind-merge, postcss-pxtorem)
- [x] 建立 Tailwind CSS utility (`utils/classNames.ts`)
- [x] 建立 Sequelize 資料庫設定 (`db/config/`)
- [x] 建立環境變數設定 (`.env.local`, `.env.example`)
- [x] 設定 i18n (next-intl with zh-tw/en)
- [x] 建立 proxy.ts (Next.js 16 routing)
- [x] 建立資料庫 Models (10 models)
- [x] 建立 MySQL 資料庫 (`pos_switch_ai_agent_next`)
- [x] 建立 Migrations (sequelize-cli 官方格式)
- [x] 執行 Migrations 建立資料表

### Phase 2: 權限系統 ✅
- [x] Seed 預設權限和角色 (sequelize-cli 官方格式)
- [x] 建立登入 API (`/api/auth/login`)
- [x] 建立登出 API (`/api/auth/logout`)
- [x] 建立 Token 刷新 API (`/api/auth/refresh`)
- [x] 建立取得用戶 API (`/api/auth/me`)
- [x] 建立權限驗證 middleware

### Phase 3: 商品 API ✅
- [x] 商品 CRUD API (`/api/products`)
- [x] 分類 CRUD API (`/api/categories`)

### Phase 4: 訂單 API ✅
- [x] 訂單 CRUD API (`/api/orders`)
- [x] 訂單品項修改 API
- [x] 付款 API (`/api/payments`)
- [x] 系統設定 API (`/api/settings`)

### Phase 4.5: API 文件 (Swagger) ✅
- [x] 安裝 Swagger 相關套件
- [x] 建立 OpenAPI 規格
- [x] 建立 Swagger UI 頁面 (`/api-docs`)
- [x] 為所有 API 端點撰寫文件

### Phase 5: POS 前端 ✅
- [x] UI 基礎元件 (Button, Input, Card)
- [x] POS 主畫面 (`/pos`)
- [x] 購物車功能
- [x] 結帳流程

### Phase 5.5: 資料庫架構擴充 ✅
- [x] 建立 DBML Schema ([database-schema.dbml](./database-schema.dbml))
- [x] 設計商品客製化 (選項群組、加購)
- [x] 設計套餐系統 (套餐、群組、選擇)

### Phase 6: 資料庫實作 ✅
- [x] 建立商品客製化 Models (OptionGroup, Option, Addon)
- [x] 建立套餐 Models (Combo, ComboGroup, ComboGroupItem)
- [x] 建立訂單客製化 Models (OrderItemOption, OrderItemAddon, OrderCombo)
- [x] 建立中介表 Models (ProductOptionGroup, ProductAddon)
- [x] 建立相關 Migrations (3 個)
- [x] 執行 Migrations 建立資料表

### Phase 7: 管理後台
- [x] 管理後台佈局 (AdminLayout, Sidebar, Header)
- [ ] 使用者管理頁面 (CRUD, 角色指派)
- [ ] 角色管理頁面 (權限勾選)
- [ ] 權限 API (Users, Roles, Permissions)
- [ ] 商品管理頁面
- [ ] 選項/加購管理頁面
- [ ] 套餐管理頁面
- [ ] 訂單查詢頁面
- [ ] 報表功能
- [ ] 系統設定頁面

---

## 資料庫文件

- **DBML Schema**: [docs/database-schema.dbml](./database-schema.dbml) (可匯入 [dbdiagram.io](https://dbdiagram.io))

### 資料表統計

| 分類 | 資料表數量 | 說明 |
|------|-----------|------|
| 權限系統 | 3 | permissions, roles, role_permissions |
| 店家/使用者 | 3 | stores, users, refresh_tokens |
| 商品系統 | 7 | categories, products, option_groups, options, addons, product_option_groups, product_addons |
| 套餐系統 | 3 | combos, combo_groups, combo_group_items |
| 訂單系統 | 6 | orders, order_items, order_item_options, order_item_addons, order_combos, order_combo_selections |
| 其他 | 2 | payments, settings |
| **總計** | **24** | |

---

## 資料庫指令

```bash
# 執行所有 migrations
pnpm db:migrate

# 復原最後一個 migration
pnpm db:migrate:undo

# 執行所有 seeders
pnpm db:seed

# 復原所有 seeders
pnpm db:seed:undo

# 重置資料庫 (復原 + 重新執行 migrations + seeders)
pnpm db:reset
```

## 預設帳號

- **Email**: admin@pos-switch.com
- **Password**: admin123

---

## 更新紀錄

### 2026-01-18
- ✅ 完成 Phase 5: POS 前端 (產品網格、購物車、結帳)
- ✅ 完成 Phase 5.5: 資料庫架構擴充設計
- ✅ 新增商品客製化設計 (選項群組、加購)
- ✅ 新增套餐系統設計
- ✅ 建立 DBML Schema 文件

### 2026-01-17
- ✅ 專案初始化完成
- ✅ 設定 i18n (next-intl) 完成
- ✅ 建立所有資料庫 Models 完成
- ✅ 修正 middleware.ts → proxy.ts (Next.js 16)
- ✅ 新增後端 ORM 最佳實踐規則到 AI coding rules
- ✅ 重寫 migrations/seeders 使用 sequelize-cli 官方格式
- ✅ 執行 migrations 建立資料表
- ✅ 執行 seeders 填充預設資料
