import type { CartLine, CompletedOrder, GroupRoom, OrderAppState, RoomParticipant } from "./types";
import { initialOrderState } from "./reducer";

export const ORDER_STORAGE_VERSION = 2;
export const ORDER_STORAGE_KEY = "dongji-order-state-v2";
export const LEGACY_ORDER_STORAGE_KEY = "dongji-order-state-v1";

type UnknownRecord = Record<string, unknown>;
function isRecord(value: unknown): value is UnknownRecord { return typeof value === "object" && value !== null && !Array.isArray(value); }
function asNumber(value: unknown, fallback = 0): number { return typeof value === "number" && Number.isFinite(value) ? value : fallback; }
function asString(value: unknown, fallback = ""): string { return typeof value === "string" ? value : fallback; }

function normalizeOrder(value: unknown, branchId: string): CompletedOrder | null {
  if (!isRecord(value)) return null;
  const id = asString(value.id); if (!id) return null;
  const amount = asNumber(value.amount);
  const mode = value.mode === "pickup" || value.mode === "dine-in" ? value.mode : "delivery";
  return {
    id, number: asString(value.number, id), amount, subtotal: asNumber(value.subtotal, amount),
    deliveryFee: asNumber(value.deliveryFee), packagingFee: asNumber(value.packagingFee), discount: asNumber(value.discount),
    branchId: asString(value.branchId, branchId), branchName: asString(value.branchName, "未知分店"), mode,
    source: value.source === "group" ? "group" : "cart",
    status: value.status === "ACCEPTED" || value.status === "PREPARING" || value.status === "READY_FOR_PICKUP" || value.status === "OUT_FOR_DELIVERY" || value.status === "COMPLETED" ? value.status : "PAID",
    paymentMethod: "LINE Pay", paymentId: asString(value.paymentId, `legacy-${id}`),
    items: Array.isArray(value.items) ? value.items as CartLine[] : [],
    participants: Array.isArray(value.participants) ? value.participants as RoomParticipant[] : [],
    note: asString(value.note), invoice: value.invoice === "company" || value.invoice === "donate" ? value.invoice : "mobile",
    createdAt: asNumber(value.createdAt, Date.now()),
  };
}

export function normalizePersistedOrderState(input: unknown): OrderAppState {
  const wrapper = isRecord(input) && input.version === ORDER_STORAGE_VERSION && isRecord(input.state) ? input.state : input;
  if (!isRecord(wrapper)) return initialOrderState;
  const branchId = asString(wrapper.branchId, initialOrderState.branchId);
  const mode = wrapper.mode === "pickup" || wrapper.mode === "dine-in" ? wrapper.mode : "delivery";
  const cartRecord = isRecord(wrapper.cart) ? wrapper.cart : {};
  const cartState = asString(cartRecord.state, "EMPTY");
  const converted = cartState === "CONVERTED";
  const items = !converted && Array.isArray(cartRecord.items) ? cartRecord.items as CartLine[] : [];
  const persistedOrders = Array.isArray(wrapper.orders) ? wrapper.orders.map((order) => normalizeOrder(order, branchId)).filter((order): order is CompletedOrder => order !== null) : [];
  const legacyOrder = normalizeOrder(wrapper.lastOrder, branchId);
  const orders = legacyOrder && !persistedOrders.some((order) => order.id === legacyOrder.id) ? [legacyOrder, ...persistedOrders] : persistedOrders;
  const candidate = asString(wrapper.lastOrderId);
  const lastOrderId = orders.some((order) => order.id === candidate) ? candidate : orders[0]?.id ?? null;
  const checkoutRecord = isRecord(wrapper.checkout) ? wrapper.checkout : {};
  const checkout = checkoutRecord.state === "PAYMENT_PENDING"
    ? { state: "FAILED" as const, attemptId: null, error: "付款流程曾中斷，請確認訂單後重新付款。" }
    : checkoutRecord.state === "FAILED"
      ? { state: "FAILED" as const, attemptId: null, error: asString(checkoutRecord.error, "付款未完成") }
      : { state: "IDLE" as const, attemptId: null, error: null };
  const roomRecord = isRecord(wrapper.room) ? wrapper.room : null;
  const roomTerminal = roomRecord && ["ORDER_CREATED", "PURGED", "EXPIRED", "CANCELLED"].includes(asString(roomRecord.state));
  const room = (orders.length > 0 && converted) || roomTerminal ? null : roomRecord as GroupRoom | null;
  return {
    branchId, mode,
    cart: { state: items.length === 0 ? "EMPTY" : cartState === "CHECKOUT_SUBMITTING" ? "EDITING" : cartState as OrderAppState["cart"]["state"], items, coupon: items.length === 0 ? "" : asString(cartRecord.coupon) },
    room, checkout, orders, lastOrderId,
  };
}

export function serializeOrderState(state: OrderAppState): string { return JSON.stringify({ version: ORDER_STORAGE_VERSION, state }); }
