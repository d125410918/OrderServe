import type { Branch, Category, Product } from "@/domain/catalog/types";

export type CatalogAppState = {
  branches: Branch[];
  selectedAdminBranchId: string;
  categoriesByBranch: Record<string, Category[]>;
  productsByBranch: Record<string, Product[]>;
};

export type CatalogAction =
  | { type: "hydrate"; state: CatalogAppState }
  | { type: "branch/selectAdmin"; branchId: string }
  | { type: "branch/create"; branch: Branch }
  | { type: "branch/update"; branchId: string; changes: Partial<Omit<Branch, "id" | "brandId" | "createdAt">> }
  | { type: "branch/publish"; branchId: string }
  | { type: "branch/pause"; branchId: string }
  | { type: "branch/resume"; branchId: string }
  | { type: "branch/archive"; branchId: string }
  | { type: "category/add"; branchId: string; category: Category }
  | { type: "category/update"; branchId: string; categoryId: string; changes: Partial<Omit<Category, "id">> }
  | { type: "category/remove"; branchId: string; categoryId: string }
  | { type: "product/add"; branchId: string; product: Product }
  | { type: "product/update"; branchId: string; productId: string; changes: Partial<Omit<Product, "id">> }
  | { type: "product/remove"; branchId: string; productId: string };
