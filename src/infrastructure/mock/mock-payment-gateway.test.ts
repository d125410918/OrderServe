import { describe, expect, it } from "vitest";
import { MockPaymentGateway } from "./mock-payment-gateway";

describe("MockPaymentGateway", () => {
  it("同一冪等鍵只建立一次付款結果", async () => {
    const gateway = new MockPaymentGateway();
    const first = await gateway.pay({ orderId: "order-1", amount: 386, idempotencyKey: "same-key" });
    const second = await gateway.pay({ orderId: "order-1", amount: 386, idempotencyKey: "same-key" });
    expect(second).toEqual(first);
    expect(gateway.processedCount).toBe(1);
  });
});
