import { describe, expect, it } from "vitest";
import { calculateCartTotals } from "./pricing";

const items = [
  { id: "a", unitPrice: 139, quantity: 2 },
  { id: "b", unitPrice: 89, quantity: 1 },
];

describe("calculateCartTotals", () => {
  it("以整數計算小計、費用、折扣與總額", () => {
    expect(calculateCartTotals(items, { deliveryFee: 49, packagingFee: 10, discount: 50 })).toEqual({
      subtotal: 367,
      deliveryFee: 49,
      packagingFee: 10,
      serviceFee: 0,
      discount: 50,
      total: 376,
    });
  });

  it("不允許折扣使總額小於零", () => {
    expect(calculateCartTotals([{ id: "a", unitPrice: 20, quantity: 1 }], { discount: 100 }).total).toBe(0);
  });

  it("拒絕負數價格與非整數金額", () => {
    expect(() => calculateCartTotals([{ id: "a", unitPrice: -1, quantity: 1 }])).toThrow("金額必須是非負整數");
    expect(() => calculateCartTotals([{ id: "a", unitPrice: 10.5, quantity: 1 }])).toThrow("金額必須是非負整數");
  });
});
