"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { CATALOG_STORAGE_KEY, normalizePersistedCatalogState, serializeCatalogState } from "@/application/catalog-store/persistence";
import { catalogReducer, createInitialCatalogState } from "@/application/catalog-store/reducer";
import type { CatalogAppState } from "@/application/catalog-store/types";
import type { Branch, Category, Product } from "@/domain/catalog/types";

type CatalogContextValue = {
  state: CatalogAppState;
  hydrated: boolean;
  storageError: string | null;
  activeBranches: Branch[];
  selectedAdminBranch: Branch | null;
  selectAdminBranch: (branchId: string) => void;
  createBranch: (branch: Branch) => void;
  updateBranch: (branchId: string, changes: Partial<Omit<Branch, "id" | "brandId" | "createdAt">>) => void;
  publishBranch: (branchId: string) => void;
  pauseBranch: (branchId: string) => void;
  resumeBranch: (branchId: string) => void;
  archiveBranch: (branchId: string) => void;
  addCategory: (branchId: string, category: Category) => void;
  updateCategory: (branchId: string, categoryId: string, changes: Partial<Omit<Category, "id">>) => void;
  removeCategory: (branchId: string, categoryId: string) => void;
  addProduct: (branchId: string, product: Product) => void;
  updateProduct: (branchId: string, productId: string, changes: Partial<Omit<Product, "id">>) => void;
  removeProduct: (branchId: string, productId: string) => void;
  getBranch: (branchId: string) => Branch;
  getCategories: (branchId: string) => Category[];
  getProducts: (branchId: string) => Product[];
  getProduct: (branchId: string, productId: string) => Product | undefined;
  resetCatalog: () => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(catalogReducer, undefined, createInitialCatalogState);
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(CATALOG_STORAGE_KEY);
    if (saved) {
      try { dispatch({ type: "hydrate", state: normalizePersistedCatalogState(JSON.parse(saved)) }); }
      catch { dispatch({ type: "hydrate", state: createInitialCatalogState() }); }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CATALOG_STORAGE_KEY, serializeCatalogState(state));
      setStorageError(null);
    } catch {
      setStorageError("瀏覽器儲存空間不足。請刪除不需要的高容量菜品圖片後再儲存。");
    }
  }, [state, hydrated]);

  const activeBranches = useMemo(() => state.branches.filter((branch) => branch.lifecycle === "ACTIVE" && branch.isOpen), [state.branches]);
  const selectedAdminBranch = useMemo(() => state.branches.find((branch) => branch.id === state.selectedAdminBranchId) ?? null, [state.branches, state.selectedAdminBranchId]);
  const selectAdminBranch = useCallback((branchId: string) => dispatch({ type: "branch/selectAdmin", branchId }), []);
  const createBranch = useCallback((branch: Branch) => dispatch({ type: "branch/create", branch }), []);
  const updateBranch = useCallback((branchId: string, changes: Partial<Omit<Branch, "id" | "brandId" | "createdAt">>) => dispatch({ type: "branch/update", branchId, changes }), []);
  const publishBranch = useCallback((branchId: string) => dispatch({ type: "branch/publish", branchId }), []);
  const pauseBranch = useCallback((branchId: string) => dispatch({ type: "branch/pause", branchId }), []);
  const resumeBranch = useCallback((branchId: string) => dispatch({ type: "branch/resume", branchId }), []);
  const archiveBranch = useCallback((branchId: string) => dispatch({ type: "branch/archive", branchId }), []);
  const addCategory = useCallback((branchId: string, category: Category) => dispatch({ type: "category/add", branchId, category }), []);
  const updateCategory = useCallback((branchId: string, categoryId: string, changes: Partial<Omit<Category, "id">>) => dispatch({ type: "category/update", branchId, categoryId, changes }), []);
  const removeCategory = useCallback((branchId: string, categoryId: string) => dispatch({ type: "category/remove", branchId, categoryId }), []);
  const addProduct = useCallback((branchId: string, product: Product) => dispatch({ type: "product/add", branchId, product }), []);
  const updateProduct = useCallback((branchId: string, productId: string, changes: Partial<Omit<Product, "id">>) => dispatch({ type: "product/update", branchId, productId, changes }), []);
  const removeProduct = useCallback((branchId: string, productId: string) => dispatch({ type: "product/remove", branchId, productId }), []);
  const getBranch = useCallback((branchId: string) => state.branches.find((branch) => branch.id === branchId) ?? activeBranches[0] ?? state.branches[0], [state.branches, activeBranches]);
  const getCategories = useCallback((branchId: string) => state.categoriesByBranch[branchId] ?? [], [state.categoriesByBranch]);
  const getProducts = useCallback((branchId: string) => state.productsByBranch[branchId] ?? [], [state.productsByBranch]);
  const getProduct = useCallback((branchId: string, productId: string) => (state.productsByBranch[branchId] ?? []).find((product) => product.id === productId), [state.productsByBranch]);
  const resetCatalog = useCallback(() => {
    window.localStorage.removeItem(CATALOG_STORAGE_KEY);
    dispatch({ type: "hydrate", state: createInitialCatalogState() });
  }, []);

  const value = useMemo<CatalogContextValue>(() => ({
    state, hydrated, storageError, activeBranches, selectedAdminBranch,
    selectAdminBranch, createBranch, updateBranch, publishBranch, pauseBranch, resumeBranch, archiveBranch,
    addCategory, updateCategory, removeCategory, addProduct, updateProduct, removeProduct,
    getBranch, getCategories, getProducts, getProduct, resetCatalog,
  }), [state, hydrated, storageError, activeBranches, selectedAdminBranch, selectAdminBranch, createBranch, updateBranch, publishBranch, pauseBranch, resumeBranch, archiveBranch, addCategory, updateCategory, removeCategory, addProduct, updateProduct, removeProduct, getBranch, getCategories, getProducts, getProduct, resetCatalog]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog 必須在 CatalogProvider 內使用");
  return context;
}
