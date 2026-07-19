import { describe, expect, it } from "vitest";
import { getBranchPublishErrors, transitionBranch } from "./branch-machine";
import type { Branch, Category, Product } from "./types";

const branch: Branch = {
  id: "new-store",
  brandId: "dongji",
  name: "新分店",
  address: "台北市測試路 1 號",
  phone: "02-1234-5678",
  eta: "20–30 分鐘",
  isOpen: false,
  deliveryFee: 40,
  packagingFee: 10,
  lifecycle: "SETUP",
  createdAt: 1,
};
const category: Category = { id: "main", name: "主餐", description: "主餐分區" };
const product: Product = {
  id: "p1",
  categoryId: "main",
  name: "測試餐點",
  shortDescription: "測試",
  description: "測試餐點",
  price: 100,
  image: "data:image/webp;base64,AAAA",
  illustration: "chicken",
  modifiers: [],
  available: true,
};

describe("branch machine", () => {
  it("新分店資料不完整時不得發布", () => {
    expect(getBranchPublishErrors(branch, [], [])).toContain("至少建立一個菜單分區");
    expect(() => transitionBranch("SETUP", "PUBLISH", { branch, categories: [], products: [] })).toThrow("分店尚未符合發布條件");
  });

  it("分區與含圖片商品完整時可發布，並可暫停與恢復", () => {
    expect(getBranchPublishErrors(branch, [category], [product])).toEqual([]);
    expect(transitionBranch("SETUP", "PUBLISH", { branch, categories: [category], products: [product] })).toBe("ACTIVE");
    expect(transitionBranch("ACTIVE", "PAUSE")).toBe("PAUSED");
    expect(transitionBranch("PAUSED", "RESUME")).toBe("ACTIVE");
  });
});
