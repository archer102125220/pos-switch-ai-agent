# 開發環境測試帳號

> [!CAUTION]
> **本文件僅供開發與測試環境使用**  
> 請勿在正式環境使用這些預設帳號密碼！  
> 正式環境部署前務必修改所有預設帳號資訊。

---

## 預設測試帳號

### 系統管理員 (Admin)

- **Email**: `admin@pos-switch.com`
- **Password**: `admin123`
- **角色**: Admin（管理員）
- **權限**: 所有權限
  - 品項維護 (product_management)
  - 結帳 (checkout)
  - 歷史訂單查詢 (order_history)
  - 統計資料閱覽 (statistics)
  - 系統設定管理 (system_settings)

### 測試店長 (Manager)

- **Email**: `manager@pos-switch.com`
- **Password**: `manager123`
- **角色**: Manager（店長）
- **權限**: 除了系統設定管理外的所有權限
  - 品項維護 (product_management)
  - 結帳 (checkout)
  - 歷史訂單查詢 (order_history)
  - 統計資料閱覽 (statistics)

### 測試收銀員 (Cashier)

- **Email**: `cashier@pos-switch.com`
- **Password**: `cashier123`
- **角色**: Cashier（收銀員）
- **權限**: 結帳與訂單查詢
  - 結帳 (checkout)
  - 歷史訂單查詢 (order_history)

### 測試查帳員 (Auditor)

- **Email**: `auditor@pos-switch.com`
- **Password**: `auditor123`
- **角色**: Auditor（查帳員）
- **權限**: 訂單查詢與統計
  - 歷史訂單查詢 (order_history)
  - 統計資料閱覽 (statistics)

---

## 角色與權限說明

系統中預設建立了以下角色：

| 角色 | 說明 | 權限 |
|------|------|------|
| **Admin** | 管理員 - 擁有所有權限 | ✅ 品項維護<br>✅ 結帳<br>✅ 歷史訂單查詢<br>✅ 統計資料閱覽<br>✅ 系統設定管理 |
| **Manager** | 店長 - 擁有所有權限 | ✅ 品項維護<br>✅ 結帳<br>✅ 歷史訂單查詢<br>✅ 統計資料閱覽 |
| **Cashier** | 收銀員 - 結帳與訂單查詢 | ✅ 結帳<br>✅ 歷史訂單查詢 |
| **Auditor** | 查帳員 - 訂單查詢與統計 | ✅ 歷史訂單查詢<br>✅ 統計資料閱覽 |

---

## 建立測試帳號

如需建立額外的測試帳號，可以透過以下方式：

### 方法一：透過 Seeder

在 `db/seeders` 目錄建立新的 seeder 檔案，參考 [20260117120100-initial-data.ts](file:///c:/Users/User/Desktop/code/pos-switch-ai-agent/db/seeders/20260117120100-initial-data.ts)。

```bash
# 建立新的 seeder
npx sequelize-cli seed:generate --name test-users

# 執行 seeder
pnpm db:seed
```

### 方法二：透過管理後台

1. 使用管理員帳號登入
2. 進入「使用者管理」功能（待實作）
3. 手動建立新帳號並分配角色

---

## 預設系統設定

系統預設的設定值（可透過管理後台修改）：

- **結帳模式** (`checkout_mode`): `pre_pay`（先付款）
- **允許訂單修改** (`allow_order_modification`): `true`
- **稅率** (`tax_rate`): `0`
- **收據抬頭** (`receipt_header`): `感謝您的光臨`
- **收據頁尾** (`receipt_footer`): `歡迎再次光臨`
- **單一裝置登入** (`auth_single_device_login`): `false`
- **Token 輪替** (`auth_token_rotation`): `true`

---

## 預設店家資訊

- **店名**: 總店
- **地址**: 台北市
- **電話**: 02-1234-5678

---

## 預設商品分類

系統初始化時會建立以下分類：

1. **飲料** - 各式飲品
2. **餐點** - 正餐、輕食
3. **點心** - 甜點、小食

---

## 重置開發環境

如需重置所有資料回到初始狀態：

```bash
# 重置資料庫（刪除所有資料並重新執行 migrations 和 seeders）
pnpm db:reset
```

> [!WARNING]
> 此指令會**刪除所有現有資料**，請謹慎使用！

---

## 相關檔案

- 初始化 Seeder: [db/seeders/20260117120100-initial-data.ts](./../db/seeders/20260117120100-initial-data.ts)
- 資料庫架構: [docs/database-schema.dbml](./../docs/database-schema.dbml)
- 認證實作計畫: [docs/auth_implementation_plan.md](./../docs/auth_implementation_plan.md)

---

**Last Updated**: 2026-01-23
