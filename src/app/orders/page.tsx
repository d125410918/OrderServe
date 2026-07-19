"use client";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/presentation/components/page-header";
import { useOrder } from "@/presentation/providers/order-provider";
export default function OrdersPage() {
  const { state, hydrated } = useOrder();
  return <main className="page-gradient"><PageHeader title="我的訂單" subtitle="查看已完成付款的訂單與餐點快照" />{!hydrated ? null : state.orders.length === 0 ? <section className="page-card"><div className="page-card__body empty-state"><ClipboardList size={42} /><h2>目前沒有訂單</h2><Link href="/menu" className="button button--primary">開始點餐</Link></div></section> : <section className="page-card"><div className="page-card__body cart-list">{state.orders.map((order) => <article className="cart-line" key={order.id}><div><h3>{order.number}</h3><p>{order.branchName}・{new Date(order.createdAt).toLocaleString("zh-TW")}</p></div><div className="cart-line__actions"><strong className="price">NT$ {order.amount}</strong><Link href={`/orders/${order.id}`} className="button button--outline">查看明細</Link></div></article>)}</div></section>}</main>;
}
