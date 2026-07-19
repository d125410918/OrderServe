import { describe, expect, it } from "vitest";
import { transitionRoom } from "./room-machine";

describe("transitionRoom", () => {
  it("完成建立、開放、鎖定、審核、付款與成單流程", () => {
    expect(transitionRoom("CREATED", "OPEN")).toBe("OPEN");
    expect(transitionRoom("OPEN", "LOCK")).toBe("LOCKED");
    expect(transitionRoom("LOCKED", "REVIEW")).toBe("REVIEWING");
    expect(transitionRoom("REVIEWING", "READY_FOR_CHECKOUT")).toBe("CHECKOUT_PENDING");
    expect(transitionRoom("CHECKOUT_PENDING", "CREATE_PAYMENT")).toBe("PAYMENT_PENDING");
    expect(transitionRoom("PAYMENT_PENDING", "PAYMENT_SUCCEEDED")).toBe("ORDER_CREATED");
  });

  it("允許付款前重新開放但禁止成單後重開", () => {
    expect(transitionRoom("LOCKED", "REOPEN")).toBe("OPEN");
    expect(() => transitionRoom("ORDER_CREATED", "REOPEN")).toThrow("非法房間狀態轉換");
  });
});
