import { describe, expect, it } from "vitest";
import { allocateProportionally } from "./allocation";

describe("allocateProportionally", () => {
  it("依小計比例分配並確保總和完全一致", () => {
    const result = allocateProportionally(10, [
      { participantId: "p1", subtotal: 100 },
      { participantId: "p2", subtotal: 200 },
      { participantId: "p3", subtotal: 300 },
    ]);
    expect(result).toEqual({ p1: 2, p2: 3, p3: 5 });
    expect(Object.values(result).reduce((sum, value) => sum + value, 0)).toBe(10);
  });

  it("相同餘數時依 participantId 穩定分配", () => {
    expect(allocateProportionally(2, [
      { participantId: "b", subtotal: 1 },
      { participantId: "a", subtotal: 1 },
      { participantId: "c", subtotal: 1 },
    ])).toEqual({ a: 1, b: 1, c: 0 });
  });

  it("所有小計為零時平均分配", () => {
    expect(allocateProportionally(5, [
      { participantId: "a", subtotal: 0 },
      { participantId: "b", subtotal: 0 },
    ])).toEqual({ a: 3, b: 2 });
  });
});
