"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock3, Copy, Link2, MapPin, Megaphone, Plus, QrCode, Send, UsersRound } from "lucide-react";
import { PageHeader } from "@/presentation/components/page-header";
import { useOrder } from "@/presentation/providers/order-provider";
import { useCatalog } from "@/presentation/providers/catalog-provider";
import type { RoomParticipant } from "@/application/order-store/types";

const seedParticipants: RoomParticipant[] = [
  { id: "p1", name: "小美", status: "submitted", subtotal: 228, items: [{ lineId: "p1a", productId: "original-chicken", name: "咚雞原味炸雞", image: "", illustration: "chicken", unitPrice: 139, quantity: 1, selections: [], note: "" }, { lineId: "p1b", productId: "golden-bites", name: "黃金脆皮雞球", image: "", illustration: "nuggets", unitPrice: 89, quantity: 1, selections: [], note: "" }] },
  { id: "p2", name: "阿凱", status: "submitted", subtotal: 288, items: [{ lineId: "p2a", productId: "korean-spicy", name: "韓式辣味炸雞", image: "", illustration: "spicy", unitPrice: 149, quantity: 1, selections: [], note: "" }, { lineId: "p2b", productId: "original-chicken", name: "咚雞原味炸雞", image: "", illustration: "chicken", unitPrice: 139, quantity: 1, selections: [], note: "" }] },
  { id: "p3", name: "小花", status: "submitted", subtotal: 364, items: [{ lineId: "p3a", productId: "double-feast", name: "人氣雙享餐", image: "", illustration: "meal", unitPrice: 329, quantity: 1, selections: [], note: "" }, { lineId: "p3b", productId: "cola", name: "冰涼可樂", image: "", illustration: "drink", unitPrice: 35, quantity: 1, selections: [], note: "" }] },
  { id: "p4", name: "大明", status: "editing", subtotal: 149, items: [{ lineId: "p4a", productId: "pepper-chicken", name: "蒜香椒鹽炸雞", image: "", illustration: "spicy", unitPrice: 149, quantity: 1, selections: [], note: "" }] },
];

function formatRemaining(deadlineAt: number): string {
  const seconds = Math.max(0, Math.floor((deadlineAt - Date.now()) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function GroupRoomPage() {
  const router = useRouter();
  const { state, hydrated, submitParticipant, lockRoom, extendRoom, prepareRoomCheckout, clearCart } = useOrder();
  const { getBranch } = useCatalog();
  const [remaining, setRemaining] = useState("15:00");
  useEffect(() => {
    if (hydrated && !state.room) router.replace("/group/join");
  }, [hydrated, state.room, router]);
  useEffect(() => {
    if (!state.room) return;
    if (state.room.participants.length === 0) seedParticipants.forEach(submitParticipant);
  }, [state.room, submitParticipant]);
  useEffect(() => {
    if (!state.room) return;
    const updateCountdown = () => {
      setRemaining(formatRemaining(state.room!.deadlineAt));
      if (Date.now() >= state.room!.deadlineAt && state.room!.state === "OPEN") lockRoom();
    };
    const timer = window.setInterval(updateCountdown, 1000);
    updateCountdown();
    return () => window.clearInterval(timer);
  }, [state.room, lockRoom]);
  const room = state.room;
  const branch = getBranch(room?.branchId ?? state.branchId);
  const participants = room?.participants.length ? room.participants : seedParticipants;
  const submitted = participants.filter((participant) => participant.status === "submitted").length;
  const itemCount = participants.reduce((sum, participant) => sum + participant.items.reduce((value, item) => value + item.quantity, 0), 0);
  const total = participants.reduce((sum, participant) => sum + participant.subtotal, 0);
  const title = room?.title ?? "午餐一起點";
  const code = room?.code ?? "482761";

  function submitMyCart() {
    if (!state.room || state.cart.items.length === 0) return;
    const subtotal = state.cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    submitParticipant({ id: `current-${state.room.code}`, name: state.room.hostName || "我", status: "submitted", items: state.cart.items, subtotal });
    clearCart();
  }

  function sendOrder() {
    if (!room || submitted === 0 || !["OPEN", "LOCKED"].includes(room.state)) return;
    prepareRoomCheckout();
    router.push("/checkout");
  }

  if (!hydrated || !room) return <main className="page-gradient"><PageHeader title="一起點房間" subtitle="正在確認房間資料…" /></main>;

  return <main className="page-gradient"><div className="room-hero"><PageHeader title={title} subtitle={`房號 ${code}`} actions={<span className="countdown-chip"><Clock3 size={17} /> 剩餘 {remaining}</span>} /></div><section className="page-card"><div className="room-info-grid"><div className="room-info"><strong><MapPin size={19} />{branch.name}</strong><p>{state.mode === "delivery" ? "外送" : "自取"}・可切換分店</p></div><div className="room-info"><strong><UsersRound size={19} />一起點模式</strong><p>各自點餐・合併結帳</p></div><div className="room-info"><strong><Megaphone size={19} />房主公告</strong><p>{room?.announcement ?? "大家想吃的都點起來！"}</p></div></div></section><section className="page-card"><div className="page-card__header"><h2>分享房間</h2></div><div className="page-card__body share-grid"><button className="share-button" type="button"><Link2 />複製連結</button><button className="share-button" type="button"><QrCode />QR Code</button><button className="share-button" type="button"><Copy />複製房號</button></div></section><section className="page-card"><div className="page-card__header"><div><h2>我的餐點</h2><span className="muted">先選餐，再提交至房間統計</span></div>{state.cart.items.length === 0 ? <Link href="/menu" className="button button--gold"><Plus size={17} />新增餐點</Link> : <button type="button" className="button button--primary" onClick={submitMyCart}>提交我的餐點</button>}</div><div className="page-card__body">{state.cart.items.length === 0 ? <p className="muted" style={{ margin: 0 }}>目前沒有待提交餐點。提交後其他成員即可看到明細與金額。</p> : state.cart.items.map((item) => <div className="participant-item" key={item.lineId}><span>{item.name} × {item.quantity}</span><strong>NT$ {item.unitPrice * item.quantity}</strong></div>)}</div></section><section className="page-card"><div className="page-card__header"><div><h2>成員與餐點（{participants.length}）</h2><span className="muted">{submitted} 人已送出・{participants.length - submitted} 人編輯中</span></div></div><div className="page-card__body"><div className="participant-grid">{participants.map((participant) => <article className={`participant-card ${participant.status === "editing" ? "is-editing" : ""}`} key={participant.id}><div className="participant-card__header"><span className="avatar">{participant.name.slice(0, 1)}</span><strong>{participant.name}</strong><span className={`status-pill ${participant.status === "editing" ? "status-pill--editing" : ""}`}>{participant.status === "editing" ? "編輯中" : "已送出"}</span></div>{participant.items.map((item) => <div className="participant-item" key={item.lineId}><span>{item.name}</span><span>NT$ {item.unitPrice * item.quantity}</span></div>)}<div className="participant-card__total"><span>小計</span><strong className="price">NT$ {participant.subtotal}</strong></div></article>)}</div><div className="room-summary"><div><strong>{participants.length} 人</strong><span className="muted">成員總數</span></div><div><strong>{itemCount} 項</strong><span className="muted">餐點總數</span></div><div><strong className="price">NT$ {total.toLocaleString("zh-TW")}</strong><span className="muted">目前總金額</span></div></div><div className="room-actions"><button className="button button--outline" type="button" onClick={() => extendRoom(5 * 60_000)}><Clock3 size={18} />延長時間</button><button className="button button--primary" type="button" disabled={submitted === 0 || !["OPEN", "LOCKED"].includes(room.state)} onClick={sendOrder}><Send size={18} />送出訂單</button></div></div></section></main>;
}
