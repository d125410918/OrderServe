"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Eye, ImagePlus, Pencil, Plus, Rocket, Trash2, X } from "lucide-react";
import type { Product } from "@/domain/catalog/types";
import { getBranchPublishErrors } from "@/domain/catalog/branch-machine";
import { AdminShell } from "@/features/admin/admin-shell";
import { readProductImage } from "@/features/admin/product-image";
import { ProductVisual } from "@/presentation/components/product-visual";
import { useCatalog } from "@/presentation/providers/catalog-provider";

const illustrationOptions: Array<{ value: Product["illustration"]; label: string }> = [
  { value: "chicken", label: "炸雞" }, { value: "spicy", label: "辣味" }, { value: "nuggets", label: "雞球" }, { value: "meal", label: "套餐" },
  { value: "fries", label: "薯條" }, { value: "drink", label: "飲料" }, { value: "rice", label: "飯食" }, { value: "dessert", label: "甜點" },
];

type ProductDraft = {
  name: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  price: string;
  originalPrice: string;
  tag: "" | "熱門" | "新品" | "限定";
  illustration: Product["illustration"];
  image: string;
  available: boolean;
  featured: boolean;
  spicy: boolean;
};

function emptyDraft(categoryId = ""): ProductDraft {
  return { name: "", categoryId, shortDescription: "", description: "", price: "", originalPrice: "", tag: "", illustration: "chicken", image: "", available: true, featured: false, spicy: false };
}

export default function AdminMenuPage() {
  const { state, selectedAdminBranch, storageError, selectAdminBranch, getCategories, getProducts, addCategory, removeCategory, addProduct, updateProduct, removeProduct, publishBranch } = useCatalog();
  const branchId = selectedAdminBranch?.id ?? state.branches[0]?.id ?? "";
  const categories = getCategories(branchId);
  const products = getProducts(branchId);
  const [activeCategory, setActiveCategory] = useState("all");
  const [categoryName, setCategoryName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(() => emptyDraft());
  const [imageBusy, setImageBusy] = useState(false);
  const [error, setError] = useState("");
  const visible = useMemo(() => activeCategory === "all" ? products : products.filter((product) => product.categoryId === activeCategory), [activeCategory, products]);
  const publishErrors = selectedAdminBranch ? getBranchPublishErrors(selectedAdminBranch, categories, products) : [];

  function switchBranch(nextBranchId: string) {
    selectAdminBranch(nextBranchId);
    setActiveCategory("all");
    setEditingId(null);
    setDraft(emptyDraft());
    setError("");
  }

  function createCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    const name = categoryName.trim();
    if (!name) return;
    try {
      addCategory(branchId, { id: `category-${Date.now().toString(36)}`, name, description: "" });
      setCategoryName("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "無法新增分區"); }
  }

  function deleteCategory(categoryId: string) {
    setError("");
    try { removeCategory(branchId, categoryId); if (activeCategory === categoryId) setActiveCategory("all"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "無法刪除分區"); }
  }

  function openNewProduct() {
    setError("");
    if (categories.length === 0) { setError("請先建立至少一個菜單分區"); return; }
    setEditingId("new");
    setDraft(emptyDraft(categories[0].id));
  }

  function openEditProduct(product: Product) {
    setEditingId(product.id);
    setDraft({
      name: product.name,
      categoryId: product.categoryId,
      shortDescription: product.shortDescription,
      description: product.description,
      price: String(product.price),
      originalPrice: product.originalPrice ? String(product.originalPrice) : "",
      tag: product.tag ?? "",
      illustration: product.illustration,
      image: product.image,
      available: product.available,
      featured: Boolean(product.featured),
      spicy: Boolean(product.spicy),
    });
    setError("");
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageBusy(true);
    setError("");
    try {
      const image = await readProductImage(file);
      setDraft((current) => ({ ...current, image }));
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : "無法處理圖片"); }
    finally { setImageBusy(false); event.target.value = ""; }
  }

  function saveProduct(event: FormEvent) {
    event.preventDefault();
    setError("");
    const price = Number(draft.price);
    if (!draft.name.trim() || !draft.categoryId || !Number.isFinite(price) || price <= 0) { setError("請填寫菜品名稱、分區與正確價格"); return; }
    if (!draft.image) { setError("請上傳菜品圖片後再儲存"); return; }
    const product: Product = {
      id: editingId === "new" ? `product-${Date.now().toString(36)}` : editingId ?? `product-${Date.now().toString(36)}`,
      categoryId: draft.categoryId,
      name: draft.name.trim(),
      shortDescription: draft.shortDescription.trim(),
      description: draft.description.trim(),
      price,
      originalPrice: draft.originalPrice ? Math.max(0, Number(draft.originalPrice) || 0) : undefined,
      tag: draft.tag || undefined,
      spicy: draft.spicy || undefined,
      featured: draft.featured || undefined,
      image: draft.image,
      illustration: draft.illustration,
      modifiers: editingId && editingId !== "new" ? products.find((item) => item.id === editingId)?.modifiers ?? [] : [],
      available: draft.available,
    };
    try {
      if (editingId === "new") addProduct(branchId, product);
      else if (editingId) updateProduct(branchId, editingId, product);
      setEditingId(null);
      setDraft(emptyDraft(categories[0]?.id ?? ""));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "無法儲存菜品"); }
  }

  function publish() {
    if (!selectedAdminBranch) return;
    setError("");
    try { publishBranch(selectedAdminBranch.id); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "無法發布分店"); }
  }

  return <AdminShell title="菜單與分區管理" actions={<button className="button button--primary" type="button" onClick={openNewProduct}><Plus size={18} />新增菜品</button>}>
    <section className="admin-branch-toolbar"><label>管理分店<select value={branchId} onChange={(event) => switchBranch(event.target.value)}>{state.branches.filter((branch) => branch.lifecycle !== "ARCHIVED").map((branch) => <option value={branch.id} key={branch.id}>{branch.name}（{branch.lifecycle === "SETUP" ? "設定中" : branch.lifecycle === "ACTIVE" ? "營業中" : "暫停"}）</option>)}</select></label><div><strong>{selectedAdminBranch?.name}</strong><span className="muted">每間分店皆使用獨立菜單，不會互相覆蓋。</span></div>{selectedAdminBranch?.lifecycle === "SETUP" && <button className="button button--gold" type="button" disabled={publishErrors.length > 0} onClick={publish}><Rocket size={18} />發布分店</button>}</section>
    {(error || storageError) && <div className="admin-alert" role="alert">{error || storageError}</div>}
    {selectedAdminBranch?.lifecycle === "SETUP" && <section className="setup-progress"><div className={categories.length > 0 ? "is-complete" : ""}><strong>1</strong><span>建立分區</span></div><div className={products.length > 0 ? "is-complete" : ""}><strong>2</strong><span>新增菜品</span></div><div className={products.some((product) => product.image) ? "is-complete" : ""}><strong>3</strong><span>上傳圖片</span></div><div className={publishErrors.length === 0 ? "is-complete" : ""}><strong>4</strong><span>發布營業</span></div></section>}
    <section className="admin-category-manager"><form onSubmit={createCategory}><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="輸入新分區名稱，例如：主餐" /><button className="button button--soft" type="submit"><Plus size={17} />新增分區</button></form><div className="admin-category-list">{categories.map((category) => <span key={category.id}>{category.name}<button type="button" onClick={() => deleteCategory(category.id)} aria-label={`刪除${category.name}`}><X size={14} /></button></span>)}</div></section>
    <div className="admin-tabs"><button type="button" className={`admin-tab ${activeCategory === "all" ? "is-active" : ""}`} onClick={() => setActiveCategory("all")}>全部菜品</button>{categories.map((category) => <button type="button" className={`admin-tab ${activeCategory === category.id ? "is-active" : ""}`} onClick={() => setActiveCategory(category.id)} key={category.id}>{category.name}</button>)}</div>
    <section className="admin-panel"><div className="admin-panel__header"><div><h2>{selectedAdminBranch?.name}專屬菜單</h2><span className="muted">菜品圖片會壓縮後保存於此瀏覽器，JPG、PNG、WebP 皆可。</span></div><a className="button button--outline" href="/menu"><Eye size={18} />顧客端預覽</a></div><div className="admin-panel__body admin-panel__body--scroll">{visible.length === 0 ? <div className="empty-state"><ImagePlus size={42} /><h3>這個分店目前沒有菜品</h3><p className="muted">先建立分區，再新增第一項菜品與圖片。</p><button className="button button--primary" type="button" onClick={openNewProduct}>新增第一項菜品</button></div> : <table className="admin-table branch-menu-table"><thead><tr><th>菜品</th><th>分區</th><th>價格</th><th>供應狀態</th><th>操作</th></tr></thead><tbody>{visible.map((product) => <tr key={product.id}><td data-label="菜品"><div className="menu-item-admin"><div className="menu-item-admin__art"><ProductVisual image={product.image} kind={product.illustration} size="thumb" alt={product.name} /></div><div><strong>{product.name}</strong><div className="muted">{product.shortDescription || "尚未填寫簡介"}</div></div></div></td><td data-label="分區">{categories.find((category) => category.id === product.categoryId)?.name ?? "未分類"}</td><td data-label="價格">NT$ {product.price}</td><td data-label="供應狀態"><input className="toggle" type="checkbox" checked={product.available} onChange={(event) => updateProduct(branchId, product.id, { available: event.target.checked })} aria-label={`${product.name}供應狀態`} /></td><td data-label="操作"><div className="table-actions"><button className="button button--soft" type="button" onClick={() => openEditProduct(product)}><Pencil size={16} />編輯</button><button className="icon-button" type="button" onClick={() => removeProduct(branchId, product.id)} aria-label={`刪除${product.name}`}><Trash2 size={17} /></button></div></td></tr>)}</tbody></table>}</div></section>
    {editingId && <div className="admin-modal-backdrop"><section className="admin-modal admin-modal--wide" role="dialog" aria-modal="true" aria-labelledby="product-editor-title"><div className="admin-modal__header"><div><h2 id="product-editor-title">{editingId === "new" ? "新增菜品" : "編輯菜品"}</h2><p className="muted">圖片會自動縮放至最長邊 900px，降低儲存空間占用。</p></div><button className="icon-button" type="button" onClick={() => setEditingId(null)} aria-label="關閉"><X /></button></div><form className="admin-product-editor" onSubmit={saveProduct}><div className="product-image-uploader"><div className="product-image-uploader__preview"><ProductVisual image={draft.image} kind={draft.illustration} size="hero" alt={draft.name || "菜品圖片預覽"} /></div><label className="button button--outline"><ImagePlus size={18} />{imageBusy ? "圖片處理中…" : draft.image ? "更換圖片" : "上傳菜品圖片"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} disabled={imageBusy} hidden /></label>{draft.image && <button type="button" className="button button--soft" onClick={() => setDraft({ ...draft, image: "" })}>移除圖片</button>}</div><div className="admin-form"><label>菜品名稱<input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label>菜單分區<select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label><div className="admin-form__two"><label>售價<input type="number" min="1" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} /></label><label>原價（選填）<input type="number" min="0" value={draft.originalPrice} onChange={(event) => setDraft({ ...draft, originalPrice: event.target.value })} /></label></div><label>卡片簡介<input value={draft.shortDescription} onChange={(event) => setDraft({ ...draft, shortDescription: event.target.value })} maxLength={60} /></label><label>完整說明<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} maxLength={300} /></label><div className="admin-form__two"><label>標籤<select value={draft.tag} onChange={(event) => setDraft({ ...draft, tag: event.target.value as ProductDraft["tag"] })}><option value="">無</option><option value="熱門">熱門</option><option value="新品">新品</option><option value="限定">限定</option></select></label><label>備用插圖<select value={draft.illustration} onChange={(event) => setDraft({ ...draft, illustration: event.target.value as Product["illustration"] })}>{illustrationOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select></label></div><div className="editor-checks"><label><input type="checkbox" checked={draft.available} onChange={(event) => setDraft({ ...draft, available: event.target.checked })} />供應中</label><label><input type="checkbox" checked={draft.featured} onChange={(event) => setDraft({ ...draft, featured: event.target.checked })} />首頁主打</label><label><input type="checkbox" checked={draft.spicy} onChange={(event) => setDraft({ ...draft, spicy: event.target.checked })} />辣味</label></div>{error && <div className="form-error">{error}</div>}<div className="admin-modal__actions"><button className="button button--outline" type="button" onClick={() => setEditingId(null)}>取消</button><button className="button button--primary" type="submit" disabled={imageBusy}>儲存菜品</button></div></div></form></section></div>}
  </AdminShell>;
}
