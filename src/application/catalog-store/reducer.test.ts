import { describe, expect, it } from "vitest";
import { catalogReducer, createInitialCatalogState } from "./reducer";

const newBranch = {
  id: "kaohsiung",
  brandId: "dongji",
  name: "高雄測試店",
  address: "高雄市測試路 10 號",
  phone: "07-123-4567",
  eta: "25–35 分鐘",
  isOpen: false,
  deliveryFee: 45,
  packagingFee: 10,
  lifecycle: "SETUP" as const,
  createdAt: 100,
};

describe("catalogReducer", () => {
  it("新增分店會建立完全空白且獨立的菜單", () => {
    const state = createInitialCatalogState();
    const next = catalogReducer(state, { type: "branch/create", branch: newBranch });
    expect(next.selectedAdminBranchId).toBe(newBranch.id);
    expect(next.categoriesByBranch[newBranch.id]).toEqual([]);
    expect(next.productsByBranch[newBranch.id]).toEqual([]);
    expect(next.productsByBranch.xinyi.length).toBeGreaterThan(0);
  });

  it("新增商品只會寫入目前指定分店", () => {
    const state = catalogReducer(createInitialCatalogState(), { type: "branch/create", branch: newBranch });
    const withCategory = catalogReducer(state, { type: "category/add", branchId: newBranch.id, category: { id: "main", name: "主餐", description: "" } });
    const product = { id: "meal", categoryId: "main", name: "高雄限定餐", shortDescription: "", description: "", price: 180, image: "data:image/webp;base64,AAAA", illustration: "meal" as const, modifiers: [], available: true };
    const next = catalogReducer(withCategory, { type: "product/add", branchId: newBranch.id, product });
    expect(next.productsByBranch[newBranch.id]).toEqual([product]);
    expect(next.productsByBranch.xinyi.some((item) => item.id === product.id)).toBe(false);
  });

  it("符合條件後發布分店會同步開放顧客端選擇", () => {
    let state = catalogReducer(createInitialCatalogState(), { type: "branch/create", branch: newBranch });
    state = catalogReducer(state, { type: "category/add", branchId: newBranch.id, category: { id: "main", name: "主餐", description: "" } });
    state = catalogReducer(state, { type: "product/add", branchId: newBranch.id, product: { id: "meal", categoryId: "main", name: "高雄限定餐", shortDescription: "", description: "", price: 180, image: "data:image/webp;base64,AAAA", illustration: "meal", modifiers: [], available: true } });
    const next = catalogReducer(state, { type: "branch/publish", branchId: newBranch.id });
    expect(next.branches.find((item) => item.id === newBranch.id)?.lifecycle).toBe("ACTIVE");
    expect(next.branches.find((item) => item.id === newBranch.id)?.isOpen).toBe(true);
  });
});
