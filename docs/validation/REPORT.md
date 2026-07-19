# 驗證報告

本報告記錄咚雞點餐系統 v1.0 的最終驗證範圍。

## 自動驗證

- Vitest：購物車計價、客製選項、比例分攤、房間狀態機、訂單狀態機、Reducer、Mock Payment Gateway。
- ESLint：`src` 與 `tests`，不允許警告。
- Next.js Production Build：所有 App Router 路由完成 TypeScript 與正式建置。
- E2E：390×844 手機與 1440×1000 桌面。

## E2E 流程

1. 菜單快速加入商品。
2. 購物車進入結帳。
3. LINE Pay 模擬付款。
4. 建立一起點房間。
5. 顯示參與者個別餐點與金額。
6. 一起點送單與個人明細快照。
7. 管理端儀表板。
8. 主要頁面水平溢位檢查。
9. 手機管理端標題高度回歸檢查。

## 架構檢查

- 掃描 46 個 TypeScript／TSX 檔案。
- 內部相依邊 60。
- 循環相依 0。

## 視覺截圖

截圖位於本目錄的 `screenshots/` 子目錄。

## 最終乾淨封裝驗證

- 從不含 `node_modules` 與 `.next` 的封裝目錄執行 `npm ci` 成功。
- `npm audit --omit=dev --audit-level=moderate`：0 vulnerabilities。
- 乾淨封裝目錄再次通過 21 項測試、Lint、正式建置與手機／桌面 E2E。
