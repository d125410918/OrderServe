import { transitionBranch } from "@/domain/catalog/branch-machine";
import type { Branch, Category, Product } from "@/domain/catalog/types";
import { branches as seedBranches, categories as seedCategories, products as seedProducts } from "@/infrastructure/mock/catalog";
import type { CatalogAction, CatalogAppState } from "./types";

function cloneCategories(): Category[] { return seedCategories.map((item) => ({ ...item })); }
function cloneProducts(): Product[] {
  return seedProducts.map((item) => ({
    ...item,
    modifiers: item.modifiers.map((group) => ({ ...group, options: group.options.map((option) => ({ ...option })) })),
  }));
}

export function createInitialCatalogState(): CatalogAppState {
  const categoriesByBranch: Record<string, Category[]> = {};
  const productsByBranch: Record<string, Product[]> = {};
  seedBranches.forEach((branch) => {
    categoriesByBranch[branch.id] = cloneCategories();
    productsByBranch[branch.id] = cloneProducts();
  });
  return {
    branches: seedBranches.map((branch) => ({ ...branch })),
    selectedAdminBranchId: seedBranches[0]?.id ?? "",
    categoriesByBranch,
    productsByBranch,
  };
}

function updateBranch(state: CatalogAppState, branchId: string, updater: (branch: Branch) => Branch): Branch[] {
  return state.branches.map((branch) => branch.id === branchId ? updater(branch) : branch);
}

export function catalogReducer(state: CatalogAppState, action: CatalogAction): CatalogAppState {
  switch (action.type) {
    case "hydrate": return action.state;
    case "branch/selectAdmin": return state.branches.some((branch) => branch.id === action.branchId) ? { ...state, selectedAdminBranchId: action.branchId } : state;
    case "branch/create": {
      if (state.branches.some((branch) => branch.id === action.branch.id)) throw new Error("分店代碼已存在");
      return {
        ...state,
        branches: [...state.branches, action.branch],
        selectedAdminBranchId: action.branch.id,
        categoriesByBranch: { ...state.categoriesByBranch, [action.branch.id]: [] },
        productsByBranch: { ...state.productsByBranch, [action.branch.id]: [] },
      };
    }
    case "branch/update": return { ...state, branches: updateBranch(state, action.branchId, (branch) => ({ ...branch, ...action.changes })) };
    case "branch/publish": {
      const branch = state.branches.find((item) => item.id === action.branchId);
      if (!branch) return state;
      const lifecycle = transitionBranch(branch.lifecycle, "PUBLISH", { branch, categories: state.categoriesByBranch[action.branchId] ?? [], products: state.productsByBranch[action.branchId] ?? [] });
      return { ...state, branches: updateBranch(state, action.branchId, (item) => ({ ...item, lifecycle, isOpen: true })) };
    }
    case "branch/pause": return { ...state, branches: updateBranch(state, action.branchId, (branch) => ({ ...branch, lifecycle: transitionBranch(branch.lifecycle, "PAUSE"), isOpen: false })) };
    case "branch/resume": return { ...state, branches: updateBranch(state, action.branchId, (branch) => ({ ...branch, lifecycle: transitionBranch(branch.lifecycle, "RESUME"), isOpen: true })) };
    case "branch/archive": return { ...state, branches: updateBranch(state, action.branchId, (branch) => ({ ...branch, lifecycle: transitionBranch(branch.lifecycle, "ARCHIVE"), isOpen: false })) };
    case "category/add": {
      const current = state.categoriesByBranch[action.branchId] ?? [];
      if (current.some((category) => category.id === action.category.id)) throw new Error("分區代碼已存在");
      return { ...state, categoriesByBranch: { ...state.categoriesByBranch, [action.branchId]: [...current, action.category] } };
    }
    case "category/update": return { ...state, categoriesByBranch: { ...state.categoriesByBranch, [action.branchId]: (state.categoriesByBranch[action.branchId] ?? []).map((category) => category.id === action.categoryId ? { ...category, ...action.changes } : category) } };
    case "category/remove": {
      if ((state.productsByBranch[action.branchId] ?? []).some((product) => product.categoryId === action.categoryId)) throw new Error("此分區仍有菜品，請先移動或刪除菜品");
      return { ...state, categoriesByBranch: { ...state.categoriesByBranch, [action.branchId]: (state.categoriesByBranch[action.branchId] ?? []).filter((category) => category.id !== action.categoryId) } };
    }
    case "product/add": {
      const current = state.productsByBranch[action.branchId] ?? [];
      if (current.some((product) => product.id === action.product.id)) throw new Error("菜品代碼已存在");
      return { ...state, productsByBranch: { ...state.productsByBranch, [action.branchId]: [...current, action.product] } };
    }
    case "product/update": return { ...state, productsByBranch: { ...state.productsByBranch, [action.branchId]: (state.productsByBranch[action.branchId] ?? []).map((product) => product.id === action.productId ? { ...product, ...action.changes } : product) } };
    case "product/remove": return { ...state, productsByBranch: { ...state.productsByBranch, [action.branchId]: (state.productsByBranch[action.branchId] ?? []).filter((product) => product.id !== action.productId) } };
    default: return state;
  }
}
