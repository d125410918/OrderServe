import { describe, expect, it } from "vitest";
import { buildCheckoutLines } from "./checkout-lines";
const cartItem = { lineId: "cart-1", productId: "a", name: "購物車餐點", image: "", illustration: "chicken" as const, unitPrice: 100, quantity: 1, selections: [], note: "" };
const roomItem = { lineId: "room-1", productId: "b", name: "房間餐點", image: "", illustration: "spicy" as const, unitPrice: 200, quantity: 1, selections: [], note: "" };
describe("buildCheckoutLines", () => {
  it("一起點房間有已提交餐點時優先建立個別參與者明細", () => { const result = buildCheckoutLines([cartItem], [{ id: "p1", name: "小美", status: "submitted", subtotal: 200, items: [roomItem] }]); expect(result[0].lineId).toBe("p1-room-1"); expect(result[0].participantName).toBe("小美"); });
  it("沒有房間餐點時使用一般購物車", () => { expect(buildCheckoutLines([cartItem], [])[0].name).toBe("購物車餐點"); });
  it("購物車與房間皆空時不得產生可付款的示範品項", () => { expect(buildCheckoutLines([], [])).toEqual([]); });
});
