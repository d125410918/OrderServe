export type RoomState = "CREATED" | "OPEN" | "LOCKED" | "REVIEWING" | "CHECKOUT_PENDING" | "PAYMENT_PENDING" | "ORDER_CREATED" | "EXPIRED" | "CANCELLED" | "PURGED";
export type RoomEvent = "OPEN" | "LOCK" | "REOPEN" | "REVIEW" | "READY_FOR_CHECKOUT" | "CREATE_PAYMENT" | "PAYMENT_SUCCEEDED" | "EXPIRE" | "CANCEL" | "PURGE";

const transitions: Record<RoomState, Partial<Record<RoomEvent, RoomState>>> = {
  CREATED: { OPEN: "OPEN", CANCEL: "CANCELLED" },
  OPEN: { LOCK: "LOCKED", EXPIRE: "EXPIRED", CANCEL: "CANCELLED" },
  LOCKED: { REOPEN: "OPEN", REVIEW: "REVIEWING", CANCEL: "CANCELLED" },
  REVIEWING: { READY_FOR_CHECKOUT: "CHECKOUT_PENDING", REOPEN: "OPEN", CANCEL: "CANCELLED" },
  CHECKOUT_PENDING: { CREATE_PAYMENT: "PAYMENT_PENDING", REOPEN: "OPEN", CANCEL: "CANCELLED" },
  PAYMENT_PENDING: { PAYMENT_SUCCEEDED: "ORDER_CREATED", CANCEL: "CANCELLED" },
  ORDER_CREATED: { PURGE: "PURGED" },
  EXPIRED: { PURGE: "PURGED" },
  CANCELLED: { PURGE: "PURGED" },
  PURGED: {},
};

export function transitionRoom(state: RoomState, event: RoomEvent): RoomState {
  const next = transitions[state][event];
  if (!next) throw new Error(`非法房間狀態轉換：${state} -> ${event}`);
  return next;
}
