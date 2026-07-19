"use client";

import { BellRing, CheckCircle2, ChefHat, Printer, ShoppingBag, Truck } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";
import type { CompletedOrder } from "@/application/order-store/types";
import type { OrderEvent, OrderState } from "@/domain/order/order-machine";
import { useOrder } from "@/presentation/providers/order-provider";
import { useCatalog } from "@/presentation/providers/catalog-provider";

const statusText: Partial<Record<OrderState, string>> = { PAID: "已付款", ACCEPTED: "店家已接單", PREPARING: "製作中", READY_FOR_PICKUP: "待取餐", OUT_FOR_DELIVERY: "配送中", COMPLETED: "已完成" };
function nextAction(order: CompletedOrder): { event: OrderEvent; label: string; icon: typeof ChefHat } | null {
  switch (order.status) {
    case "PAID": return { event: "ACCEPT", label: "接受訂單", icon: CheckCircle2 };
    case "ACCEPTED": return { event: "PREPARE", label: "開始製作", icon: ChefHat };
    case "PREPARING": return order.mode === "delivery" ? { event: "DISPATCH", label: "開始配送", icon: Truck } : { event: "READY", label: "待取餐", icon: ShoppingBag };
    case "READY_FOR_PICKUP": case "OUT_FOR_DELIVERY": return { event: "COMPLETE", label: "完成訂單", icon: CheckCircle2 };
    default: return null;
  }
}
export default function AdminOrdersPage() {
  const { state, hydrated, transitionOrderStatus } = useOrder();
  const { selectedAdminBranch } = useCatalog();
  const orders = state.orders.filter((order) => !selectedAdminBranch || order.branchId === selectedAdminBranch.id);
  return <AdminShell title="即時訂單工作台" actions={<button className="button button--soft" type="button"><BellRing size={18} />提示音已開啟</button>}><section className="admin-panel"><div className="admin-panel__body">{!hydrated ? <p className="muted">正在載入訂單…</p> : orders.length === 0 ? <div className="empty-state"><ChefHat size={42} /><h2>目前沒有顧客訂單</h2><p className="muted">顧客完成付款後會立即顯示於此。</p></div> : orders.map((order) => { const action = nextAction(order); const Icon = action?.icon; return <article className="order-row" key={order.id}><div><span className="order-code">#{order.number}</span><div className="muted">{new Date(order.createdAt).toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" })}</div></div><div><strong>{order.source === "group" ? `一起點（${order.participants.length} 人）` : "顧客訂單"}・{order.mode === "delivery" ? "外送" : order.mode === "pickup" ? "自取" : "店內"}</strong><div className="muted">{order.items.map((item) => item.name).join("、")}</div></div><div><strong>NT$ {order.amount}</strong><br /><span className={`order-status ${order.status === "COMPLETED" ? "order-status--paid" : ""}`}>{statusText[order.status] ?? order.status}</span></div><div style={{ display: "flex", gap: 8 }}><button className="icon-button" type="button" aria-label={`列印訂單${order.number}`}><Printer size={17} /></button>{action && Icon && <button className="button button--primary" type="button" aria-label={`${action.label}${order.number}`} onClick={() => transitionOrderStatus(order.id, action.event)}><Icon size={17} />{action.label}</button>}</div></article>; })}</div></section></AdminShell>;
}
