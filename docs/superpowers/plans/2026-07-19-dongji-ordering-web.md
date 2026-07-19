# 咚雞點餐完整網站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可直接部署至 Vercel 的多品牌餐飲點餐網站前端，完整展示一般點餐、商品客製、一起點房間、購物車結帳、訂單追蹤與管理後台核心流程。

**Architecture:** 使用 Next.js App Router 與 TypeScript。商業規則集中於 `src/domain`，資料存取透過 `src/application/ports` 介面與 `src/infrastructure` 實作，React UI 只透過 application actions 與 context store 操作；房間、購物車、訂單使用離散狀態機，避免以零散布林值控制流程。

**Tech Stack:** Next.js 16、React 19、TypeScript 5.8、CSS Modules/Global CSS、Vitest、Testing Library、Playwright、Lucide React。

## Global Constraints

- 所有畫面使用繁體中文與 TWD 整數金額。
- 顧客端行動優先；管理端桌面優先並支援平板。
- 美術採暖紅、深炭黑、暖白與金黃，參考圖僅作視覺約束，不直接作頁面背景。
- 商業邏輯不得直接寫在 React 元件內。
- Room、Cart、Order 必須採 State Machine。
- 不串接真實 Supabase 或 LINE Pay 憑證；以明確 Adapter 與 Mock Gateway 提供可替換邊界。
- 專案須可執行 `npm run test`、`npm run lint`、`npm run build`。

---

### Task 1: 專案骨架與設計系統

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `eslint.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/presentation/components/ui/*`

**Interfaces:**
- Produces: 共用按鈕、卡片、標籤、輸入元件與品牌色變數。

- [ ] 建立 Next.js 專案與測試設定。
- [ ] 寫入全域 design tokens、響應式斷點與可及性樣式。
- [ ] 建立共用 UI 元件並加入基本 render 測試。
- [ ] 執行測試與 lint。

### Task 2: 領域模型、金額計算與狀態機

**Files:**
- Create: `src/domain/catalog/types.ts`
- Create: `src/domain/cart/cart-machine.ts`, `src/domain/cart/pricing.ts`
- Create: `src/domain/group-order/room-machine.ts`, `src/domain/group-order/allocation.ts`
- Create: `src/domain/order/order-machine.ts`
- Test: `src/domain/**/*.test.ts`

**Interfaces:**
- Produces: `calculateCartTotals`, `allocateProportionally`, `transitionCart`, `transitionRoom`, `transitionOrder`。

- [ ] 先撰寫價格、比例分攤與合法／非法狀態轉換失敗測試。
- [ ] 確認測試因功能尚未存在而失敗。
- [ ] 實作最小領域邏輯。
- [ ] 執行全部測試並重構去除重複。

### Task 3: Mock Repository、應用服務與全域 Store

**Files:**
- Create: `src/application/ports/*.ts`
- Create: `src/application/services/*.ts`
- Create: `src/infrastructure/mock/*.ts`
- Create: `src/presentation/providers/order-provider.tsx`
- Test: `src/application/**/*.test.ts`

**Interfaces:**
- Produces: catalog query、cart commands、room commands、checkout command、admin menu commands。

- [ ] 先寫應用服務測試，驗證 UI 不需依賴具體資料來源。
- [ ] 建立 Port 介面與 Mock Adapter。
- [ ] 建立 React Provider，保存 localStorage 狀態並處理 hydration。
- [ ] 驗證跨頁購物車與房間狀態。

### Task 4: 顧客菜單與商品客製

**Files:**
- Create: `src/app/menu/page.tsx`, `src/app/product/[id]/page.tsx`
- Create: `src/features/menu/*`, `src/features/product/*`
- Test: `src/features/menu/*.test.tsx`, `src/features/product/*.test.tsx`

**Interfaces:**
- Consumes: catalog service、cart commands。
- Produces: 分區導覽、搜尋篩選、商品卡與商品客製提交。

- [ ] 先寫搜尋、分類切換、必選欄位與加入購物車測試。
- [ ] 實作行動版菜單頁與桌面自適應。
- [ ] 實作商品詳情、單選、複選、備註與數量。
- [ ] 視覺檢查與鍵盤操作檢查。

### Task 5: 一起點建立、加入與房間總覽

**Files:**
- Create: `src/app/group/create/page.tsx`, `src/app/group/join/page.tsx`, `src/app/group/room/page.tsx`
- Create: `src/features/group-order/*`
- Test: `src/features/group-order/*.test.tsx`

**Interfaces:**
- Consumes: room application service、catalog/cart commands。
- Produces: 六碼房號、倒數、參與者卡、送出／撤回、房主送單。

- [ ] 先寫建立房間、加入、截止鎖定與成員總額測試。
- [ ] 實作建立表單與分享面板。
- [ ] 實作參與者總覽、倒數、編輯狀態與房主操作。
- [ ] 驗證 100 人資料渲染策略與狀態去重邏輯。

### Task 6: 購物車、結帳、付款模擬與訂單成功

**Files:**
- Create: `src/app/cart/page.tsx`, `src/app/checkout/page.tsx`, `src/app/order/success/page.tsx`
- Create: `src/features/checkout/*`, `src/infrastructure/mock/mock-payment-gateway.ts`
- Test: `src/features/checkout/*.test.tsx`

**Interfaces:**
- Produces: 調整數量、優惠、費用、LINE Pay 模擬、不可變訂單摘要。

- [ ] 先寫金額顯示、付款冪等與失敗重試測試。
- [ ] 實作購物車與結帳欄位。
- [ ] 實作付款模擬與成功追蹤頁。
- [ ] 驗證重複點擊不會產生重複訂單。

### Task 7: 管理端儀表板、即時訂單與菜單管理

**Files:**
- Create: `src/app/admin/page.tsx`, `src/app/admin/orders/page.tsx`, `src/app/admin/menu/page.tsx`, `src/app/admin/branches/page.tsx`
- Create: `src/features/admin/*`
- Test: `src/features/admin/*.test.tsx`

**Interfaces:**
- Produces: 桌面側欄、KPI、訂單看板、提示音啟用、菜單 CRUD 模擬、分店覆寫與 QR Code 預覽。

- [ ] 先寫訂單狀態更新、菜單啟停與分店覆寫測試。
- [ ] 實作管理端響應式 shell。
- [ ] 實作訂單工作台與通知提示。
- [ ] 實作菜單與分店管理模擬。

### Task 8: 完整性、可及性與視覺驗證

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/core-flows.spec.ts`
- Create: `README.md`, `.env.example`, `vercel.json`

**Interfaces:**
- Produces: 可重複驗證的一般點餐、一起點、結帳與管理流程。

- [ ] 執行 unit/component tests。
- [ ] 執行 lint 與 production build。
- [ ] 啟動正式 build 並執行 Playwright 核心流程與手機／桌面截圖。
- [ ] 對照設計約束檢查色彩、間距、固定 CTA、溢位與響應式。
- [ ] 發現問題先建立失敗測試，再修正並重新執行全部驗證。

### Task 9: 打包交付

**Files:**
- Create: `docs/VERIFICATION.md`
- Create: `/mnt/data/咚雞點餐系統_完整網頁專案.zip`

- [ ] 記錄實際測試命令與結果。
- [ ] 移除 `.next`、`node_modules` 與測試輸出，保留 lockfile。
- [ ] 確認 ZIP 解壓後可 `npm install && npm run build`。
- [ ] 產生最終 ZIP。
