"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Filter, Plus, Search, UsersRound } from "lucide-react";
import { BottomCartBar } from "@/presentation/components/bottom-cart-bar";
import { ProductArt } from "@/presentation/components/product-art";
import { SiteHeader } from "@/presentation/components/site-header";
import { categories, products } from "@/infrastructure/mock/catalog";
import { filterProducts, type ProductFilter } from "@/features/menu/filter-products";
import { useOrder } from "@/presentation/providers/order-provider";

const filters: Array<{ value: ProductFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "popular", label: "熱門 🔥" },
  { value: "new", label: "新品 ✨" },
  { value: "spicy", label: "辣味 🌶️" },
  { value: "available", label: "供應中" },
];

export default function MenuPage() {
  const { addToCart } = useOrder();
  const [categoryId, setCategoryId] = useState("all");
  const [filter, setFilter] = useState<ProductFilter>("all");
  const [query, setQuery] = useState("");
  const visibleProducts = useMemo(() => filterProducts(products, { categoryId, query, filter }), [categoryId, query, filter]);

  function quickAdd(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product || !product.available) return;
    addToCart({
      lineId: `${product.id}-quick`,
      productId: product.id,
      name: product.name,
      image: product.image,
      illustration: product.illustration,
      unitPrice: product.price,
      quantity: 1,
      selections: [],
      note: "",
    });
  }

  return (
    <main className="app-shell">
      <SiteHeader />
      <section className="menu-toolbar" aria-label="菜單工具列">
        <div className="menu-toolbar__inner">
          <label className="search-box">
            <Search size={20} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋餐點，例如：炸雞、套餐、飲料" aria-label="搜尋餐點" />
          </label>
          <div className="toolbar-actions">
            <button type="button" className="button button--outline" onClick={() => setFilter(filter === "available" ? "all" : "available")}><Filter size={18} /><span>篩選</span></button>
            <Link href="/group/create" className="button button--gold"><UsersRound size={18} /><span>一起點</span></Link>
          </div>
          <div className="category-tabs" role="tablist" aria-label="菜單分區">
            <button type="button" className={`category-tab ${categoryId === "all" ? "is-active" : ""}`} onClick={() => setCategoryId("all")}>全部餐點</button>
            {categories.map((category) => <button type="button" role="tab" aria-selected={categoryId === category.id} key={category.id} className={`category-tab ${categoryId === category.id ? "is-active" : ""}`} onClick={() => setCategoryId(category.id)}>{category.name}</button>)}
          </div>
        </div>
      </section>

      <div className="content-shell">
        <section className="hero-banner" aria-label="人氣套餐推薦">
          <div className="hero-banner__copy">
            <span className="hero-banner__eyebrow">咚雞人氣推薦</span>
            <h1>雙享餐</h1>
            <p>招牌炸雞＋黃金小點＋冰涼飲料 2 杯</p>
            <div className="hero-banner__price"><strong>只要 NT$329</strong><del>NT$446</del></div>
            <Link href="/product/double-feast" className="button button--gold" style={{ marginTop: 22 }}>查看套餐</Link>
          </div>
          <div className="hero-banner__art"><span className="hero-badge">現省<br />NT$117</span><ProductArt kind="meal" size="hero" /></div>
        </section>

        <div className="filter-chips" aria-label="快速篩選">
          {filters.map((item) => <button key={item.value} type="button" className={`filter-chip ${filter === item.value ? "is-active" : ""}`} onClick={() => setFilter(item.value)}>{item.label}</button>)}
        </div>

        <section className="section" aria-labelledby="menu-results-title">
          <div className="section-heading">
            <div><h2 id="menu-results-title">今天想吃什麼？</h2><p>{visibleProducts.length} 項餐點，依餐廳設定順序顯示</p></div>
          </div>
          {visibleProducts.length > 0 ? (
            <div className="product-grid">
              {visibleProducts.map((product) => (
                <article className={`product-card ${product.available ? "" : "is-sold-out"}`} key={product.id}>
                  <Link href={`/product/${product.id}`} className="product-card__visual" aria-label={`查看${product.name}`}>
                    {product.tag && <span className={`product-card__badge ${product.tag === "新品" ? "product-card__badge--new" : ""}`}>{product.tag}</span>}
                    <ProductArt kind={product.illustration} />
                  </Link>
                  <div className="product-card__body">
                    <Link href={`/product/${product.id}`}><h3>{product.spicy ? "🌶️ " : ""}{product.name}</h3></Link>
                    <p>{product.shortDescription}</p>
                    <div className="product-card__footer">
                      <span className="price">NT$ {product.price}<>{product.originalPrice && <del>NT$ {product.originalPrice}</del>}</></span>
                      {product.available ? <button type="button" className="product-card__add" onClick={() => quickAdd(product.id)} aria-label={`快速加入${product.name}`}><Plus /></button> : <span className="status-pill status-pill--editing">暫時售完</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><Search size={38} /><h3>找不到符合條件的餐點</h3><p className="muted">請調整關鍵字、分區或篩選條件。</p></div>}
        </section>
      </div>
      <BottomCartBar />
    </main>
  );
}
