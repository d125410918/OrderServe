# 驗證報告 v1.0.2

- Vitest：15 個測試檔、40 項測試通過。
- ESLint：0 errors、0 warnings。
- Next.js Production Build：15 個路由建置通過。
- 手機 E2E：390×844 一般點餐、付款、訂單查詢、一起點、路由守衛、新增乾淨分店、分區、菜品圖片、發布、跨店購物車隔離與水平溢位檢查通過。
- 桌面 E2E：1440×1000 相同核心流程與版面檢查通過。
- 新分店：`SETUP` 空白建立、分店菜單隔離、圖片發布條件與 `ACTIVE／PAUSED` 狀態轉換均有自動測試。
- 圖片：JPG、PNG、WebP 格式與 6 MB 上限有單元測試；實際瀏覽器上傳、壓縮、保存與顧客端顯示有 E2E 驗證。
- 視覺截圖：新增 `desktop-branch-menu.png`、`mobile-branch-menu.png`、`desktop-branches-v102.png`。

完整分析見 `STATE_MACHINE_AUDIT.md`。
