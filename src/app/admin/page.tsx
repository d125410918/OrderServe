"use client";

import { useState } from "react";
import Link from "next/link";
import { BellRing, CircleDollarSign, ClipboardList, Clock3, TrendingUp, UsersRound } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";

const recentOrders = [
  { code: "#D1208", customer: "林小姐・外送", items: "3 項餐點", amount: 386, status: "待接單" },
  { code: "#D1207", customer: "午餐一起點・5 人", items: "8 項餐點", amount: 1029, status: "已付款" },
  { code: "#D1206", customer: "陳先生・自取", items: "2 項餐點", amount: 288, status: "製作中" },
  { code: "#D1205", customer: "桌號 A12・店內", items: "4 項餐點", amount: 517, status: "待取餐" },
];

export default function AdminDashboardPage() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  return <AdminShell title="營運儀表板" actions={<button type="button" className={`button ${soundEnabled ? "button--soft" : "button--primary"}`} onClick={() => setSoundEnabled((value) => !value)}><BellRing size={18} />{soundEnabled ? "提示音已啟用" : "啟用提示音"}</button>}><section className="kpi-grid"><div className="kpi-card"><span className="kpi-card__icon"><CircleDollarSign /></span><strong>NT$ 48,620</strong><span className="muted">今日營業額・較昨日 +12.8%</span></div><div className="kpi-card"><span className="kpi-card__icon"><ClipboardList /></span><strong>126</strong><span className="muted">今日完成訂單</span></div><div className="kpi-card"><span className="kpi-card__icon"><Clock3 /></span><strong>8</strong><span className="muted">等待處理訂單</span></div><div className="kpi-card"><span className="kpi-card__icon"><UsersRound /></span><strong>14</strong><span className="muted">今日一起點房間</span></div></section><section className="admin-grid"><div className="admin-panel"><div className="admin-panel__header"><h2>即時訂單</h2><Link href="/admin/orders" className="button button--soft">查看全部</Link></div><div className="admin-panel__body">{recentOrders.map((order) => <div className="order-row" key={order.code}><span className="order-code">{order.code}</span><div><strong>{order.customer}</strong><div className="muted">{order.items}</div></div><strong>NT$ {order.amount}</strong><span className={`order-status ${order.status === "已付款" ? "order-status--paid" : ""}`}>{order.status}</span></div>)}</div></div><aside className="admin-panel"><div className="admin-panel__header"><h2>今日重點</h2><TrendingUp color="var(--red-700)" /></div><div className="admin-panel__body"><div className="summary-list"><div className="summary-row"><span>平均客單價</span><strong>NT$ 386</strong></div><div className="summary-row"><span>一起點平均人數</span><strong>5.4 人</strong></div><div className="summary-row"><span>外送占比</span><strong>61%</strong></div><div className="summary-row"><span>付款成功率</span><strong>98.7%</strong></div></div><div style={{ marginTop: 22, background: "var(--gold-100)", borderRadius: 14, padding: 16 }}><strong>熱門餐點</strong><p style={{ marginBottom: 0 }}>咚雞原味炸雞今日已售出 186 份。</p></div></div></aside></section></AdminShell>;
}
