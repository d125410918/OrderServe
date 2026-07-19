"use client";

import { useState } from "react";
import { BellRing, CheckCircle2, ChefHat, Printer, Truck } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";

const initialOrders = [
  { id: "D1208", mode: "外送", customer: "林小姐", time: "12:08", amount: 386, items: "原味炸雞、韓式辣味炸雞、黃金脆薯", state: "待接單" },
  { id: "D1207", mode: "一起點", customer: "午餐一起點（5 人）", time: "12:06", amount: 1029, items: "共 8 項餐點，已保存個別明細", state: "已付款" },
  { id: "D1206", mode: "自取", customer: "陳先生", time: "11:58", amount: 288, items: "韓式辣味炸雞、可樂", state: "製作中" },
  { id: "D1205", mode: "店內", customer: "桌號 A12", time: "11:52", amount: 517, items: "人氣雙享餐、雞球、飲料", state: "待取餐" },
];

const nextState: Record<string, string> = { "待接單": "製作中", "已付款": "製作中", "製作中": "配送中", "待取餐": "已完成", "配送中": "已完成" };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState("全部");
  const visible = filter === "全部" ? orders : orders.filter((order) => order.state === filter);
  function advance(id: string) { setOrders((current) => current.map((order) => order.id === id ? { ...order, state: nextState[order.state] ?? order.state } : order)); }
  return <AdminShell title="即時訂單工作台" actions={<button className="button button--soft" type="button"><BellRing size={18} />提示音已開啟</button>}><div className="admin-tabs">{["全部", "待接單", "已付款", "製作中", "待取餐", "配送中", "已完成"].map((item) => <button key={item} type="button" className={`admin-tab ${filter === item ? "is-active" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div><section className="admin-panel"><div className="admin-panel__body">{visible.map((order) => <article className="order-row" key={order.id}><div><span className="order-code">#{order.id}</span><div className="muted">{order.time}</div></div><div><strong>{order.customer}・{order.mode}</strong><div className="muted">{order.items}</div></div><div><strong>NT$ {order.amount}</strong><br /><span className={`order-status ${order.state === "已完成" ? "order-status--paid" : ""}`}>{order.state}</span></div><div style={{ display: "flex", gap: 8 }}><button className="icon-button" type="button" aria-label={`列印訂單${order.id}`}><Printer size={17} /></button>{order.state !== "已完成" && <button className="button button--primary" type="button" onClick={() => advance(order.id)}>{order.state === "製作中" ? <Truck size={17} /> : order.state === "待取餐" ? <CheckCircle2 size={17} /> : <ChefHat size={17} />}{nextState[order.state] ?? "完成"}</button>}</div></article>)}</div></section></AdminShell>;
}
