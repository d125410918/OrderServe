# 流程與狀態機稽核報告 v1.0.2

## 訂單流程修正

1. 付款完成會建立不可變訂單快照並清空活動購物車、折扣碼、一起點房間與付款嘗試。
2. 成功頁、訂單清單與訂單明細均讀取真實訂單資料。
3. 已付款後回首頁不再恢復可付款購物車；再次進入結帳頁會導向最近訂單或購物車。
4. 付款中重新整理會轉成 `FAILED`，不會假裝成功或持續鎖死。
5. 管理端訂單與顧客訂單共用同一個 Order State Machine。

一般訂單：

`EMPTY → EDITING → CHECKOUT_SUBMITTING → PAID → ACCEPTED → PREPARING → READY_FOR_PICKUP／OUT_FOR_DELIVERY → COMPLETED`

一起點房間：

`OPEN → LOCKED → REVIEWING → CHECKOUT_PENDING → PAYMENT_PENDING → 訂單 PAID → 房間清除`

## 跨分店切換規則

當顧客由分店 A 切換至分店 B：

- 清空尚未付款購物車。
- 關閉活動一起點房間。
- 清除付款中或失敗狀態。
- 保留所有歷史訂單。

相同分店重複選擇不會重置資料。

## 分店生命週期

新分店固定從完全空白的 `SETUP` 開始，不會複製既有分店的分區、菜品、價格或圖片。

合法狀態：

`SETUP → ACTIVE → PAUSED → ACTIVE`

另可由 `SETUP／ACTIVE／PAUSED → ARCHIVED`。

發布 `SETUP → ACTIVE` 前必須通過：

- 分店名稱、地址與電話完整。
- 至少一個菜單分區。
- 至少一項菜品。
- 至少一項菜品已上傳圖片。
- 所有菜品指向存在的分區。
- 所有菜品名稱與價格有效。

只有 `ACTIVE` 且 `isOpen=true` 的分店會出現在顧客端。

## 分店菜單隔離

`CatalogAppState` 以 `categoriesByBranch` 與 `productsByBranch` 分別保存每間分店資料。新增、修改、刪除分區或菜品時都必須帶入 `branchId`，Reducer 只更新指定分店。

## 圖片流程

- 接受 JPG、PNG、WebP。
- 單檔上限 6 MB。
- 最長邊壓縮至 900px。
- 優先轉為 WebP quality 0.82。
- 圖片保存失敗或瀏覽器容量不足時顯示明確錯誤，不假裝儲存成功。

## 路由守衛

- `/order/success` 沒有真實訂單時顯示「找不到訂單」。
- `/checkout` 沒有有效餐點時導向最近訂單或購物車。
- `/group/room` 沒有活動房間時導向 `/group/join`。
- 暫停或不存在的分店不會留在顧客端選單。

## 持久化

- 訂單 key：`dongji-order-state-v2`。
- 分店菜單 key：`dongji-catalog-state-v1`。
- 損壞的菜單資料會回復安全預設資料。
- 訂單完成事件具冪等性，相同訂單 ID 不會重複建立。

## 驗證結果

- 15 個 Vitest 測試檔、40 項測試。
- ESLint 0 errors、0 warnings。
- Next.js 15 個路由正式建置成功。
- 手機 390×844 核心流程、分店建立與版面驗證通過。
- 桌面 1440×1000 核心流程、分店建立與版面驗證通過。

## 營運邊界

目前持久化採瀏覽器 localStorage，管理端與顧客端需在同一瀏覽器來源才能共享資料。正式多裝置、多店營運需替換 Infrastructure 持久化層為伺服器資料庫、即時服務與物件儲存。
