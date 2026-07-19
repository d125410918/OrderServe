"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, MapPin, ReceiptText, Tag, TicketCheck } from "lucide-react";
import { calculateCartTotals } from "@/domain/cart/pricing";
import { transitionOrder, type OrderState } from "@/domain/order/order-machine";
import { MockPaymentGateway } from "@/infrastructure/mock/mock-payment-gateway";
import { PageHeader } from "@/presentation/components/page-header";
import { ProductVisual } from "@/presentation/components/product-visual";
import { useCatalog } from "@/presentation/providers/catalog-provider";
import { useOrder } from "@/presentation/providers/order-provider";
import { buildCheckoutLines } from "@/features/checkout/checkout-lines";

const gateway = new MockPaymentGateway();
const checkoutRoomStates = new Set(["CHECKOUT_PENDING", "PAYMENT_PENDING"]);
type InvoiceType = "mobile" | "company" | "donate";
function createIdentity(prefix: string): string { return typeof crypto !== "undefined" && "randomUUID" in crypto ? `${prefix}-${crypto.randomUUID()}` : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export default function CheckoutPage() {
  const router = useRouter();
  const { state, hydrated, setCoupon, startCheckout, failCheckout, completeOrder } = useOrder();
  const { getBranch } = useCatalog();
  const paymentCompletedRef = useRef(false);
  const branch = getBranch(state.branchId);
  const roomParticipants = state.room && checkoutRoomStates.has(state.room.state) ? state.room.participants : [];
  const lines = useMemo(() => buildCheckoutLines(state.cart.items, roomParticipants), [state.cart.items, roomParticipants]);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponInput, setCouponInput] = useState(state.cart.coupon);
  const [invoice, setInvoice] = useState<InvoiceType>("mobile");
  const [note, setNote] = useState("請幫我放在門口，謝謝！");
  const [paying, setPaying] = useState(false);
  const discount = state.cart.coupon === "DONGJI50" ? 50 : 0;
  const totals = useMemo(() => calculateCartTotals(lines.map((item) => ({ id: item.lineId, unitPrice: item.unitPrice, quantity: item.quantity })), { deliveryFee: state.mode === "delivery" ? branch.deliveryFee : 0, packagingFee: branch.packagingFee, discount }), [lines, state.mode, branch.deliveryFee, branch.packagingFee, discount]);

  useEffect(() => {
    if (!hydrated || lines.length > 0 || state.checkout.state === "PAYMENT_PENDING" || paymentCompletedRef.current) return;
    router.replace(state.lastOrderId ? `/orders/${state.lastOrderId}` : "/cart");
  }, [hydrated, lines.length, state.checkout.state, state.lastOrderId, router]);

  function applyCoupon() { setCoupon(couponInput.trim().toUpperCase()); setCouponOpen(false); }

  async function pay() {
    if (paying || state.checkout.state === "PAYMENT_PENDING" || lines.length === 0) return;
    const attemptId = createIdentity("attempt");
    const orderId = createIdentity("order");
    setPaying(true); startCheckout(attemptId);
    try {
      const payment = await gateway.pay({ orderId, amount: totals.total, idempotencyKey: attemptId });
      const roomSnapshot = state.room && checkoutRoomStates.has(state.room.state) ? state.room.participants : [];
      let orderStatus: OrderState = "DRAFT";
      orderStatus = transitionOrder(orderStatus, "VALIDATE");
      orderStatus = transitionOrder(orderStatus, "REQUEST_PAYMENT");
      orderStatus = transitionOrder(orderStatus, "PAY");
      paymentCompletedRef.current = true;
      completeOrder({
        id: orderId,
        number: `A${new Date().toISOString().slice(0, 10).replaceAll("-", "")}${String(Date.now()).slice(-5)}`,
        amount: totals.total, subtotal: totals.subtotal, deliveryFee: totals.deliveryFee, packagingFee: totals.packagingFee, discount: totals.discount,
        branchId: branch.id, branchName: branch.name, mode: state.mode, source: roomSnapshot.length > 0 ? "group" : "cart", status: orderStatus,
        paymentMethod: "LINE Pay", paymentId: payment.paymentId,
        items: lines.map((line) => ({ ...line, selections: [...line.selections] })),
        participants: roomSnapshot.map((participant) => ({ ...participant, items: participant.items.map((item) => ({ ...item, selections: [...item.selections] })) })),
        note, invoice, createdAt: Date.now(),
      });
      router.replace("/order/success");
    } catch (error) { failCheckout(error instanceof Error ? error.message : "付款失敗，請稍後再試。"); setPaying(false); }
  }

  if (!hydrated || lines.length === 0) return <main className="page-gradient"><PageHeader title="確認訂單" subtitle="正在確認可結帳內容…" /></main>;

  return <main className="page-gradient"><PageHeader title="確認訂單" subtitle="送出前請再次確認餐點、地址與付款方式" /><div className="checkout-layout"><div>
    <section className="page-card" style={{ width: "100%" }}><div className="page-card__body"><div style={{ display: "flex", gap: 14 }}><MapPin color="var(--red-700)" /><div><strong>{branch.name} <span className="status-pill status-pill--editing">{state.mode === "delivery" ? "外送" : "自取"}</span></strong><p className="muted" style={{ margin: "4px 0" }}>預計送達時間 {branch.eta}</p><span>{branch.address} 5 樓之 3</span><br /><span>張小雞・0912-345-678</span></div></div></div></section>
    <section className="page-card" style={{ width: "100%" }}><div className="page-card__body cart-list">{lines.map((item) => <article className="cart-line" key={item.lineId}><div className="cart-line__visual"><ProductVisual image={item.image} kind={item.illustration} size="thumb" alt={item.name} /></div><div><h3>{item.name}{item.participantName ? `（${item.participantName}）` : ""}</h3><p>{item.selections.join("・") || "標準設定"}</p></div><div className="cart-line__actions"><strong>× {item.quantity}</strong><span className="price cart-line__price">NT$ {item.unitPrice * item.quantity}</span></div></article>)}</div></section>
    <section className="page-card" style={{ width: "100%" }}><div className="page-card__header"><h3><Tag size={18} style={{ verticalAlign: "middle", marginRight: 7 }} />優惠券／折扣碼</h3><button type="button" className="button button--soft" onClick={() => setCouponOpen((value) => !value)}>{state.cart.coupon || "選擇或輸入"}</button></div>{couponOpen && <div className="page-card__body" style={{ display: "flex", gap: 8 }}><input value={couponInput} onChange={(event) => setCouponInput(event.target.value)} placeholder="輸入 DONGJI50" style={{ flex: 1, border: "1px solid var(--line)", borderRadius: 12, padding: "0 14px" }} /><button type="button" className="button button--primary" onClick={applyCoupon}>套用</button></div>}</section>
    <section className="page-card" style={{ width: "100%" }}><div className="page-card__body"><h3><CreditCard size={18} style={{ verticalAlign: "middle", marginRight: 7 }} />付款方式</h3><div className="payment-choice"><input type="radio" checked readOnly /><span className="line-pay">LINE <b>Pay</b></span><span className="muted">發起人統一付款</span></div><h3 style={{ marginTop: 24 }}><ReceiptText size={18} style={{ verticalAlign: "middle", marginRight: 7 }} />發票</h3><div className="option-list"><label className="option-item"><input type="radio" name="invoice" checked={invoice === "mobile"} onChange={() => setInvoice("mobile")} /><span>手機條碼</span></label><label className="option-item"><input type="radio" name="invoice" checked={invoice === "company"} onChange={() => setInvoice("company")} /><span>公司統編</span></label><label className="option-item"><input type="radio" name="invoice" checked={invoice === "donate"} onChange={() => setInvoice("donate")} /><span>捐贈碼</span></label></div><h3 style={{ marginTop: 24 }}>訂單備註</h3><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={100} style={{ width: "100%", minHeight: 90, border: "1px solid var(--line)", borderRadius: 14, padding: 12 }} /></div></section>
  </div><aside className="page-card checkout-summary" style={{ width: "100%" }}><div className="page-card__header"><h2>金額明細</h2><TicketCheck color="var(--red-700)" /></div><div className="page-card__body summary-list"><div className="summary-row"><span>小計</span><span>NT$ {totals.subtotal}</span></div><div className="summary-row"><span>外送費</span><span>NT$ {totals.deliveryFee}</span></div><div className="summary-row"><span>包裝費</span><span>NT$ {totals.packagingFee}</span></div>{totals.discount > 0 && <div className="summary-row" style={{ color: "var(--red-700)" }}><span>優惠折扣</span><span>− NT$ {totals.discount}</span></div>}<div className="summary-row summary-row--total"><span>應付總額</span><span className="price">NT$ {totals.total}</span></div>{state.checkout.state === "FAILED" && <p role="alert" style={{ color: "var(--danger)", fontWeight: 700 }}>{state.checkout.error}</p>}<p className="muted">示範環境會模擬 LINE Pay 成功回傳，不會產生實際扣款。</p><button type="button" className="button button--gold button--block" disabled={paying || state.checkout.state === "PAYMENT_PENDING"} onClick={pay}>{paying || state.checkout.state === "PAYMENT_PENDING" ? "付款處理中…" : "前往 LINE Pay 付款"}</button></div></aside></div></main>;
}
