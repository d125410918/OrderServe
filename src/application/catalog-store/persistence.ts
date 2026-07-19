import type { Branch, BranchLifecycleState, Category, Product } from "@/domain/catalog/types";
import { createInitialCatalogState } from "./reducer";
import type { CatalogAppState } from "./types";

export const CATALOG_STORAGE_VERSION = 1;
export const CATALOG_STORAGE_KEY = "dongji-catalog-state-v1";

type UnknownRecord = Record<string, unknown>;
function isRecord(value: unknown): value is UnknownRecord { return typeof value === "object" && value !== null && !Array.isArray(value); }
function asString(value: unknown, fallback = ""): string { return typeof value === "string" ? value : fallback; }
function asNumber(value: unknown, fallback = 0): number { return typeof value === "number" && Number.isFinite(value) ? value : fallback; }
function asBoolean(value: unknown, fallback = false): boolean { return typeof value === "boolean" ? value : fallback; }
function asLifecycle(value: unknown, isOpen: boolean): BranchLifecycleState {
  return value === "SETUP" || value === "ACTIVE" || value === "PAUSED" || value === "ARCHIVED" ? value : isOpen ? "ACTIVE" : "PAUSED";
}

function normalizeBranch(value: unknown): Branch | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  if (!id) return null;
  const isOpen = asBoolean(value.isOpen, false);
  return {
    id,
    brandId: asString(value.brandId, "dongji"),
    name: asString(value.name, "未命名分店"),
    address: asString(value.address),
    phone: asString(value.phone),
    eta: asString(value.eta, "25–35 分鐘"),
    isOpen,
    deliveryFee: Math.max(0, asNumber(value.deliveryFee, 0)),
    packagingFee: Math.max(0, asNumber(value.packagingFee, 0)),
    lifecycle: asLifecycle(value.lifecycle, isOpen),
    createdAt: asNumber(value.createdAt, Date.now()),
  };
}

function normalizeCategory(value: unknown): Category | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  const name = asString(value.name).trim();
  if (!id || !name) return null;
  return { id, name, description: asString(value.description) };
}

function normalizeProduct(value: unknown): Product | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id).trim();
  const categoryId = asString(value.categoryId).trim();
  const name = asString(value.name).trim();
  if (!id || !categoryId || !name) return null;
  const illustration = ["chicken", "spicy", "nuggets", "meal", "fries", "drink", "rice", "dessert"].includes(asString(value.illustration)) ? asString(value.illustration) as Product["illustration"] : "chicken";
  const tag = value.tag === "熱門" || value.tag === "新品" || value.tag === "限定" ? value.tag : undefined;
  return {
    id,
    categoryId,
    name,
    shortDescription: asString(value.shortDescription),
    description: asString(value.description),
    price: Math.max(0, asNumber(value.price)),
    originalPrice: typeof value.originalPrice === "number" && Number.isFinite(value.originalPrice) ? Math.max(0, value.originalPrice) : undefined,
    tag,
    spicy: value.spicy === true ? true : undefined,
    featured: value.featured === true ? true : undefined,
    image: asString(value.image),
    illustration,
    modifiers: Array.isArray(value.modifiers) ? value.modifiers as Product["modifiers"] : [],
    available: asBoolean(value.available, true),
  };
}

export function normalizePersistedCatalogState(input: unknown): CatalogAppState {
  const fallback = createInitialCatalogState();
  const wrapper = isRecord(input) && input.version === CATALOG_STORAGE_VERSION && isRecord(input.state) ? input.state : input;
  if (!isRecord(wrapper) || !Array.isArray(wrapper.branches)) return fallback;
  const branches = wrapper.branches.map(normalizeBranch).filter((item): item is Branch => item !== null);
  if (branches.length === 0) return fallback;
  const categoriesRecord = isRecord(wrapper.categoriesByBranch) ? wrapper.categoriesByBranch : {};
  const productsRecord = isRecord(wrapper.productsByBranch) ? wrapper.productsByBranch : {};
  const categoriesByBranch: Record<string, Category[]> = {};
  const productsByBranch: Record<string, Product[]> = {};
  branches.forEach((branch) => {
    const rawCategories = Array.isArray(categoriesRecord[branch.id]) ? categoriesRecord[branch.id] as unknown[] : [];
    const rawProducts = Array.isArray(productsRecord[branch.id]) ? productsRecord[branch.id] as unknown[] : [];
    categoriesByBranch[branch.id] = rawCategories.map(normalizeCategory).filter((item): item is Category => item !== null);
    productsByBranch[branch.id] = rawProducts.map(normalizeProduct).filter((item): item is Product => item !== null);
  });
  const selected = asString(wrapper.selectedAdminBranchId);
  return {
    branches,
    selectedAdminBranchId: branches.some((branch) => branch.id === selected) ? selected : branches[0].id,
    categoriesByBranch,
    productsByBranch,
  };
}

export function serializeCatalogState(state: CatalogAppState): string {
  return JSON.stringify({ version: CATALOG_STORAGE_VERSION, state });
}
