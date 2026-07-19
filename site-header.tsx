import { describe, expect, it } from "vitest";
import { transitionCart } from "./cart-machine";

describe("transitionCart", () => {
  it("依合法事件轉換購物車狀態", () => {
    expect(transitionCart("EMPTY", "ADD_ITEM")).toBe("EDITING");
    expect(transitionCart("EDITING", "VALIDATE")).toBe("VALIDATING");
    expect(transitionCart("VALIDATING", "VALIDATION_SUCCEEDED")).toBe("VALID");
    expect(transitionCart("VALID", "SUBMIT")).toBe("CHECKOUT_SUBMITTING");
    expect(transitionCart("CHECKOUT_SUBMITTING", "CONVERT")).toBe("CONVERTED");
  });

  it("拒絕非法轉換", () => {
    expect(() => transitionCart("EMPTY", "SUBMIT")).toThrow("非法購物車狀態轉換");
  });
});
