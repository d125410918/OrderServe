import { describe, expect, it } from "vitest";
import { normalizePersistedOrderState } from "./persistence";
const legacyOrder = { id: "legacy-order", number: "A2026071900001", amount: 329, branchName: "台北信義店", mode: "delivery", paymentMethod: "LINE Pay", createdAt: 1_000_000 };
describe("normalizePersistedOrderState", () => {
  it("遷移舊版已付款狀態時清除 converted 購物車並保存可查訂單", () => {
    const state = normalizePersistedOrderState({ branchId: "xinyi", mode: "delivery", cart: { state: "CONVERTED", items: [{ lineId: "old", quantity: 1 }], coupon: "DONGJI50" }, room: { state: "ORDER_CREATED" }, lastOrder: legacyOrder });
    expect(state.cart).toEqual({ state: "EMPTY", items: [], coupon: "" }); expect(state.room).toBeNull(); expect(state.orders).toHaveLength(1); expect(state.lastOrderId).toBe("legacy-order");
  });
  it("重新載入付款中狀態時轉為可重試失敗狀態，不假裝仍在付款", () => {
    const state = normalizePersistedOrderState({ branchId: "xinyi", mode: "delivery", cart: { state: "CHECKOUT_SUBMITTING", items: [], coupon: "" }, room: null, orders: [], lastOrderId: null, checkout: { state: "PAYMENT_PENDING", attemptId: "attempt-1", error: null } });
    expect(state.checkout.state).toBe("FAILED"); expect(state.checkout.attemptId).toBeNull();
  });
});
