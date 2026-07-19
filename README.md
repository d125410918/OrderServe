# 咚雞點餐系統

以 Next.js、React 與 TypeScript 製作的響應式餐飲點餐網站。專案依已確認的產品規格實作顧客端、一起點房間、購物車、LINE Pay 模擬結帳、訂單追蹤，以及品牌／分店管理後台，可直接放入 GitHub 並部署至 Vercel。

## 已完成範圍

### 顧客端

- 外送、自取、店內三種訂餐模式切換
- 分店切換、菜單搜尋、分區與快速篩選
- 商品規格、辣度、加購、備註與數量選擇
- 購物車、優惠碼、費用計算與訂單總額
- LINE Pay 模擬付款與訂單進度追蹤
- 手機、平板、桌面響應式介面

### 一起點

- 建立六碼房號、十五分鐘截止時間與分享入口
- 房主名稱、分店、取餐模式、密碼與金額上限欄位
- 參與者餐點與個人小計統計
- 房間倒數、延長時間、房主公告與送出訂單
- 一起點訂單轉入結帳後保存個人明細快照

### 管理端

- 營運儀表板、即時訂單、菜單管理、分店管理
- 多分店 QR Code 視覺與分店狀態
- 新訂單提示音開關介面
- 手機底部管理導覽與桌面側邊欄

## 架構

```text
src/
├─ app/                         Next.js App Router 頁面與全域樣式
├─ application/order-store/     購物車、付款與訂單歷程狀態
├─ application/catalog-store/   分店、分區、菜品與圖片狀態
├─ domain/                      金額、購物車、房間、訂單狀態機
├─ features/                    菜單篩選、商品客製、結帳等功能模組
├─ infrastructure/mock/         可替換的示範資料與付款 Gateway
└─ presentation/                共用視覺元件與 Provider
```

核心商業規則不放在 React 元件內。購物車、一起點房間與訂單流程使用明確狀態機；金額使用整數計算。`domain` 不依賴 Next.js、React 或資料來源，方便日後替換 Supabase、Realtime、Storage 與正式 LINE Pay。

## 環境需求

- Node.js 22.17 或以上
- npm 10 或以上

## 本機執行

```bash
npm ci
npm run dev
```

開啟 `http://localhost:3000`。

## 正式建置

```bash
npm run build
npm run start
```

## 驗證

```bash
npm run test       # Vitest 領域與功能測試
npm run lint       # ESLint
npm run build      # TypeScript 與 Next.js 正式建置
npm run test:e2e   # 手機與桌面核心操作流程
```

一次執行單元測試、Lint 與建置：

```bash
npm run verify
```

E2E 會使用獨立測試埠與精簡 Chromium，驗證一般點餐、一起點、模擬付款、管理端，以及主要頁面無整頁水平溢位。

## 主要路由

| 路由 | 功能 |
|---|---|
| `/menu` | 顧客菜單 |
| `/product/original-chicken` | 商品客製 |
| `/group/create` | 建立一起點房間 |
| `/group/join` | 加入一起點房間 |
| `/group/room` | 房間總覽與個人餐點 |
| `/cart` | 購物車 |
| `/checkout` | 結帳與付款 |
| `/order/success` | 訂單成立與進度 |
| `/admin` | 管理儀表板 |
| `/admin/orders` | 即時訂單 |
| `/admin/menu` | 菜單管理 |
| `/admin/branches` | 分店與 QR Code |

## Vercel 部署

1. 將專案推送至 GitHub。
2. 在 Vercel 匯入該 Repository。
3. Framework Preset 選擇 Next.js。
4. Build Command 使用 `npm run build`。
5. 依 `.env.example` 設定正式環境變數。

## 外部服務邊界

目前版本以 Mock Repository 與 Mock Payment Gateway 提供可完整操作的展示流程，不會產生真實扣款。正式營運時需接入：

- Supabase PostgreSQL、Authentication、Realtime、Storage
- LINE Pay 正式或 Sandbox API
- 電子發票、簡訊或其他通知服務

這些外部服務應在 `infrastructure` 層實作，不需要修改 `domain` 商業規則與主要 UI。

## 視覺驗證

實際瀏覽器截圖位於 `docs/validation/screenshots/`，包含手機菜單、商品、一起點、結帳、成功頁，以及手機與桌面管理端。

## v1.0.2 店長交付版

- 付款完成後建立可查詢訂單快照並清空活動購物車。
- 回首頁不再恢復已付款餐點；返回結帳頁不能重複付款。
- 新增訂單清單與訂單明細頁。
- 管理端接單改用真實顧客訂單與 Order State Machine。
- 一起點倒數鎖定、空房禁止結帳、付款後關閉活動房間。
- 新增版本化 localStorage 遷移與付款中斷復原。
- 店長可建立完全空白的新分店，分店菜單、分區、菜品、圖片與費用彼此隔離。
- 菜品圖片支援 JPG、PNG、WebP，會縮放並轉為 WebP 後保存。
- 分店必須完成基本資料、分區、菜品與圖片才能發布；並支援暫停及恢復營業。
- 顧客跨分店切換時會清除尚未付款資料，但保留已成立訂單。

店長操作流程見 `docs/店長操作手冊_v1.0.2.md`。詳細稽核見 `docs/validation/STATE_MACHINE_AUDIT.md`。
