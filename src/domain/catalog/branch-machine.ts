import type { Branch, BranchLifecycleState, Category, Product } from "./types";

export type BranchEvent = "PUBLISH" | "PAUSE" | "RESUME" | "ARCHIVE";

type PublishContext = { branch: Branch; categories: Category[]; products: Product[] };

export function getBranchPublishErrors(branch: Branch, categories: Category[], products: Product[]): string[] {
  const errors: string[] = [];
  if (!branch.name.trim()) errors.push("請填寫分店名稱");
  if (!branch.address.trim()) errors.push("請填寫分店地址");
  if (!branch.phone.trim()) errors.push("請填寫分店電話");
  if (categories.length === 0) errors.push("至少建立一個菜單分區");
  if (products.length === 0) errors.push("至少建立一項菜品");
  if (products.length > 0 && !products.some((product) => product.image.trim().length > 0)) errors.push("至少一項菜品需要上傳圖片");
  if (products.some((product) => !categories.some((category) => category.id === product.categoryId))) errors.push("菜品不可指向不存在的分區");
  if (products.some((product) => !product.name.trim() || !Number.isFinite(product.price) || product.price <= 0)) errors.push("菜品名稱與價格必須正確");
  return errors;
}

export function transitionBranch(state: BranchLifecycleState, event: BranchEvent, context?: PublishContext): BranchLifecycleState {
  if (event === "PUBLISH") {
    if (state !== "SETUP") throw new Error(`非法分店狀態轉換：${state} -> ${event}`);
    if (!context || getBranchPublishErrors(context.branch, context.categories, context.products).length > 0) throw new Error("分店尚未符合發布條件");
    return "ACTIVE";
  }
  if (state === "ACTIVE" && event === "PAUSE") return "PAUSED";
  if (state === "PAUSED" && event === "RESUME") return "ACTIVE";
  if ((state === "SETUP" || state === "ACTIVE" || state === "PAUSED") && event === "ARCHIVE") return "ARCHIVED";
  throw new Error(`非法分店狀態轉換：${state} -> ${event}`);
}
