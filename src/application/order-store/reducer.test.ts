import { describe, expect, it } from "vitest";
import { initialOrderState, orderReducer } from "./reducer";

const item = {
  lineId: "line-1",
  productId: "original-chicken",
  name: "咚雞原味炸雞",
  image: "",
  illustration: "chicken" as const,
  unitPrice: 149,
  quantity: 1,
  selections: ["大份"],
  note: "",
};

describe("orderReducer", () => {
  it("加入、調整與移除購物車品項", () => {
    const added = orderReducer(initialOrderState, { type: "cart/add", item });
    expect(added.cart.items).toHaveLength(1);
    expect(added.cart.state).toBe("EDITING");

    const incremented = orderReducer(added, { type: "cart/setQuantity", lineId: "line-1", quantity: 3 });
    expect(incremented.cart.items[0].quantity).toBe(3);

    const removed = orderReducer(incremented, { type: "cart/remove", lineId: "line-1" });
    expect(removed.cart.items).toHaveLength(0);
    expect(removed.cart.state).toBe("EMPTY");
  });

  it("建立房間後可提交參與者並更新總額", () => {
    const created = orderReducer(initialOrderState, {
      type: "room/create",
      payload: { code: "482761", hostName: "小美", deadlineAt: 1_000_000, branchId: "xinyi", mode: "delivery" },
    });
    expect(created.room?.state).toBe("OPEN");

    const submitted = orderReducer(created, {
      type: "room/submitParticipant",
      participant: { id: "p1", name: "小美", status: "submitted", items: [item], subtotal: 149 },
    });
    expect(submitted.room?.participants).toHaveLength(1);
    expect(submitted.room?.total).toBe(149);
  });
});
