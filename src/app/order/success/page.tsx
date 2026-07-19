"use client";

import Link from "next/link";
import { Check, ClipboardList, Home, Share2 } from "lucide-react";
import { PageHeader } from "@/presentation/components/page-header";
import { useOrder } from "@/presentation/providers/order-provider";

export default function OrderSuccessPage() {
  const { state, hydrated } = useOrder();
  const order = state.orders.find((item) => item.id === state.lastOrderId) ?? null;
  if (!hydrated) return <main className="page-gradient"><PageHeader title="訂單成立" subtitle="正在載入訂單…" /></main>;
  if (!order) return <main className="page-gradient"><PageHeader title="找不到訂單" subtitle="目前沒有可顯示的付款完成訂單。" /><section className="page-card"><div className="page-card__body empty-state"><ClipboardList size={42} /><h2>訂單資料不存在</h2><p className="muted">可能尚未完成付款，或訂單資料已被清除。</p><Link href="/menu" className="button button--primary">回到菜單</Link></div></section></main>;
  return <main className="page-gradient"><PageHeader title="訂單成立" subtitle="付款已完成，等待店家確認接單。" /><section className="page-card"><div className="success-hero"><div className="success-icon"><Check size={42} /></div><h1>付款成功，等待店家接單</h1><p className="muted">訂單編號 {order.number}</p><strong className="price" style={{ fontSize: "1.5rem" }}>付款狀態：已付款</strong></div></section><section className="page-card"><div className="page-card__header"><h2>訂單摘要</h2></div><div className="page-card__body summary-list"><div className="summary-row"><span>訂購店家</span><strong>{order.branchName}</strong></div><div className="summary-row"><span>訂單金額</span><strong className="price">NT$ {order.amount}</strong></div><div className="summary-row"><span>付款方式</span><span className="line-pay">LINE <b>Pay</b></span></div><div className="summary-row"><span>訂購方式</span><strong>{order.mode === "delivery" ? "外送" : order.mode === "pickup" ? "自取" : "店內"}</strong></div></div></section>{order.source === "group" && <section className="page-card" style={{ background: "#fffaf0" }}><div className="page-card__body"><h3>一起點明細已保存</h3><p className="muted">每位參與者的餐點與金額明細已保存在本次訂單快照。</p></div></section>}<div style={{ width: "min(920px, calc(100% - 28px))", margin: "0 auto", display: "grid", gap: 10 }}><Link href={`/orders/${order.id}`} className="button button--primary button--block"><ClipboardList size={18} />查看訂單</Link><Link href="/menu" className="button button--outline button--block"><Home size={18} />回到首頁</Link><button type="button" className="button button--outline button--block"><Share2 size={18} />分享結果</button></div></main>;
}
