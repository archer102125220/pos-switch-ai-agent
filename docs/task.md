# POS Switch AI Agent - 開發進度

## 當前階段: Phase 4 - 訂單 API

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

### Phase 5: POS 前端
- [ ] UI 基礎元件
- [ ] POS 主畫面
- [ ] 購物車功能
- [ ] 結帳流程

### Phase 6: 管理後台
- [ ] 商品管理頁面
- [ ] 訂單查詢頁面
- [ ] 報表功能
- [ ] 系統設定頁面

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

### 2026-01-17
- ✅ 專案初始化完成
- ✅ 設定 i18n (next-intl) 完成
- ✅ 建立所有資料庫 Models 完成
- ✅ 修正 middleware.ts → proxy.ts (Next.js 16)
- ✅ 新增後端 ORM 最佳實踐規則到 AI coding rules
- ✅ 重寫 migrations/seeders 使用 sequelize-cli 官方格式
- ✅ 執行 migrations 建立資料表
- ✅ 執行 seeders 填充預設資料
