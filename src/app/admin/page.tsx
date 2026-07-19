"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BellRing, CircleDollarSign, ClipboardList, Clock3, TrendingUp, UsersRound } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";
import { useOrder } from "@/presentation/providers/order-provider";
import { useCatalog } from "@/presentation/providers/catalog-provider";

export default function AdminDashboardPage() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { state, hydrated } = useOrder();
  const { selectedAdminBranch } = useCatalog();
  const orders = useMemo(() => state.orders.filter((order) => !selectedAdminBranch || order.branchId === selectedAdminBranch.id), [state.orders, selectedAdminBranch]);
  const revenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const completed = orders.filter((order) => order.status === "COMPLETED").length;
  const pending = orders.filter((order) => order.status !== "COMPLETED").length;
  const groupOrders = orders.filter((order) => order.source === "group").length;
  const average = orders.length > 0 ? Math.round(revenue / orders.length) : 0;
  const popular = useMemo(() => {
    const count = new Map<string, number>();
    orders.flatMap((order) => order.items).forEach((item) => count.set(item.name, (count.get(item.name) ?? 0) + item.quantity));
    return [...count.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
  }, [orders]);

  return <AdminShell title="營運儀表板" actions={<button type="button" className={`button ${soundEnabled ? "button--soft" : "button--primary"}`} onClick={() => setSoundEnabled((value) => !value)}><BellRing size={18} />{soundEnabled ? "提示音已啟用" : "啟用提示音"}</button>}>
    <section className="kpi-grid"><div className="kpi-card"><span className="kpi-card__icon"><CircleDollarSign /></span><strong>NT$ {revenue.toLocaleString("zh-TW")}</strong><span className="muted">目前保存訂單營業額</span></div><div className="kpi-card"><span className="kpi-card__icon"><ClipboardList /></span><strong>{completed}</strong><span className="muted">已完成訂單</span></div><div className="kpi-card"><span className="kpi-card__icon"><Clock3 /></span><strong>{pending}</strong><span className="muted">等待處理訂單</span></div><div className="kpi-card"><span className="kpi-card__icon"><UsersRound /></span><strong>{groupOrders}</strong><span className="muted">一起點訂單</span></div></section>
    <section className="admin-grid"><div className="admin-panel"><div className="admin-panel__header"><h2>{selectedAdminBranch?.name ?? "目前分店"}即時訂單</h2><Link href="/admin/orders" className="button button--soft">查看全部</Link></div><div className="admin-panel__body">{!hydrated ? <p className="muted">正在載入訂單…</p> : orders.length === 0 ? <div className="empty-state"><ClipboardList size={38} /><h3>目前沒有訂單</h3><p className="muted">顧客完成付款後會顯示於此。</p></div> : orders.slice(0, 6).map((order) => <div className="order-row" key={order.id}><span className="order-code">#{order.number.slice(-6)}</span><div><strong>{order.source === "group" ? `一起點・${order.participants.length} 人` : order.mode === "delivery" ? "顧客・外送" : order.mode === "pickup" ? "顧客・自取" : "顧客・店內"}</strong><div className="muted">{order.items.length} 項餐點</div></div><strong>NT$ {order.amount}</strong><span className={`order-status ${order.status === "COMPLETED" ? "order-status--paid" : ""}`}>{order.status === "PAID" ? "已付款" : order.status === "COMPLETED" ? "已完成" : "處理中"}</span></div>)}</div></div><aside className="admin-panel"><div className="admin-panel__header"><h2>營運摘要</h2><TrendingUp color="var(--red-700)" /></div><div className="admin-panel__body"><div className="summary-list"><div className="summary-row"><span>平均客單價</span><strong>NT$ {average}</strong></div><div className="summary-row"><span>付款訂單數</span><strong>{orders.length} 筆</strong></div><div className="summary-row"><span>一起點占比</span><strong>{orders.length ? Math.round(groupOrders / orders.length * 100) : 0}%</strong></div></div><div style={{ marginTop: 22, background: "var(--gold-100)", borderRadius: 14, padding: 16 }}><strong>熱門餐點</strong><p style={{ marginBottom: 0 }}>{popular ? `${popular[0]} 已售出 ${popular[1]} 份。` : "尚無足夠訂單資料。"}</p></div></div></aside></section>
  </AdminShell>;
}
