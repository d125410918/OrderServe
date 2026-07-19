import { describe, expect, it } from "vitest";
import { transitionOrder } from "./order-machine";

describe("transitionOrder", () => {
  it("完成付款到履約流程", () => {
    expect(transitionOrder("DRAFT", "VALIDATE")).toBe("CHECKOUT_VALIDATING");
    expect(transitionOrder("CHECKOUT_VALIDATING", "REQUEST_PAYMENT")).toBe("PAYMENT_PENDING");
    expect(transitionOrder("PAYMENT_PENDING", "PAY")).toBe("PAID");
    expect(transitionOrder("PAID", "ACCEPT")).toBe("ACCEPTED");
    expect(transitionOrder("ACCEPTED", "PREPARE")).toBe("PREPARING");
    expect(transitionOrder("PREPARING", "DISPATCH")).toBe("OUT_FOR_DELIVERY");
    expect(transitionOrder("OUT_FOR_DELIVERY", "COMPLETE")).toBe("COMPLETED");
  });

  it("禁止已完成訂單回到製作中", () => {
    expect(() => transitionOrder("COMPLETED", "PREPARE")).toThrow("非法訂單狀態轉換");
  });
});
