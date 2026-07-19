"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { calculateCartTotals } from "@/domain/cart/pricing";
import { PageHeader } from "@/presentation/components/page-header";
import { ProductVisual } from "@/presentation/components/product-visual";
import { useCatalog } from "@/presentation/providers/catalog-provider";
import { useOrder } from "@/presentation/providers/order-provider";

export default function CartPage() {
  const { state, setQuantity, removeFromCart } = useOrder();
  const { getBranch } = useCatalog();
  const branch = getBranch(state.branchId);
  const totals = calculateCartTotals(state.cart.items.map((item) => ({ id: item.lineId, unitPrice: item.unitPrice, quantity: item.quantity })), { deliveryFee: state.mode === "delivery" ? branch.deliveryFee : 0, packagingFee: branch.packagingFee });

  return <main className="page-gradient"><PageHeader title="購物車" subtitle={`${branch.name}・${state.mode === "delivery" ? "外送" : state.mode === "pickup" ? "自取" : "店內"}`} />{state.cart.items.length === 0 ? <section className="page-card"><div className="page-card__body empty-state"><ShoppingCart size={42} /><h2>購物車還是空的</h2><p className="muted">先挑選喜歡的餐點，再回來完成結帳。</p><Link href="/menu" className="button button--primary">瀏覽菜單</Link></div></section> : <><section className="page-card"><div className="page-card__body cart-list">{state.cart.items.map((item) => <article className="cart-line" key={item.lineId}><div className="cart-line__visual"><ProductVisual image={item.image} kind={item.illustration} size="thumb" alt={item.name} /></div><div><h3>{item.name}</h3>{item.selections.length > 0 && <p>{item.selections.join("・")}</p>}{item.note && <p>備註：{item.note}</p>}</div><div className="cart-line__actions"><div className="stepper"><button type="button" aria-label={`減少${item.name}數量`} onClick={() => setQuantity(item.lineId, item.quantity - 1)}><Minus size={16} /></button><strong>{item.quantity}</strong><button type="button" aria-label={`增加${item.name}數量`} onClick={() => setQuantity(item.lineId, item.quantity + 1)}><Plus size={16} /></button></div><span className="price cart-line__price">NT$ {(item.unitPrice * item.quantity).toLocaleString("zh-TW")}</span><button type="button" className="icon-button" style={{ marginTop: 8 }} onClick={() => removeFromCart(item.lineId)} aria-label={`移除${item.name}`}><Trash2 size={17} /></button></div></article>)}</div></section><section className="page-card"><div className="page-card__body summary-list"><div className="summary-row"><span>餐點小計</span><span>NT$ {totals.subtotal}</span></div><div className="summary-row"><span>外送費</span><span>NT$ {totals.deliveryFee}</span></div><div className="summary-row"><span>包裝費</span><span>NT$ {totals.packagingFee}</span></div><div className="summary-row summary-row--total"><span>應付總額</span><span className="price">NT$ {totals.total}</span></div><Link href="/checkout" className="button button--primary button--block">前往確認訂單</Link></div></section></>}</main>;
}
