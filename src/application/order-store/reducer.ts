import { transitionRoom, type RoomState } from "@/domain/group-order/room-machine";
import { transitionOrder } from "@/domain/order/order-machine";
import type { OrderAction, OrderAppState, RoomParticipant } from "./types";

export const initialOrderState: OrderAppState = {
  branchId: "xinyi",
  mode: "delivery",
  cart: { state: "EMPTY", items: [], coupon: "" },
  room: null,
  checkout: { state: "IDLE", attemptId: null, error: null },
  orders: [],
  lastOrderId: null,
};

function recalculateRoomTotal(participants: RoomParticipant[]): number {
  return participants.reduce((sum, participant) => sum + participant.subtotal, 0);
}

function prepareRoomForCheckout(state: OrderAppState): OrderAppState {
  if (!state.room) return state;
  const hasSubmitted = state.room.participants.some((participant) => participant.status === "submitted" && participant.items.length > 0);
  if (!hasSubmitted) return state;
  let roomState: RoomState = state.room.state;
  if (roomState === "OPEN") roomState = transitionRoom(roomState, "LOCK");
  if (roomState === "LOCKED") roomState = transitionRoom(roomState, "REVIEW");
  if (roomState === "REVIEWING") roomState = transitionRoom(roomState, "READY_FOR_CHECKOUT");
  return { ...state, room: { ...state.room, state: roomState } };
}

export function orderReducer(state: OrderAppState, action: OrderAction): OrderAppState {
  switch (action.type) {
    case "hydrate": return action.state;
    case "branch/set": return { ...state, branchId: action.branchId };
    case "mode/set": return { ...state, mode: action.mode };
    case "cart/add": {
      const resetRequired = ["EMPTY", "CONVERTED", "ABANDONED"].includes(state.cart.state);
      const currentItems = resetRequired ? [] : state.cart.items;
      const existing = currentItems.find((item) => item.lineId === action.item.lineId);
      const items = existing
        ? currentItems.map((item) => item.lineId === action.item.lineId ? { ...item, quantity: item.quantity + action.item.quantity } : item)
        : [...currentItems, action.item];
      return { ...state, cart: { coupon: resetRequired ? "" : state.cart.coupon, items, state: "EDITING" } };
    }
    case "cart/setQuantity": {
      if (action.quantity <= 0) return orderReducer(state, { type: "cart/remove", lineId: action.lineId });
      return { ...state, cart: { ...state.cart, state: "EDITING", items: state.cart.items.map((item) => item.lineId === action.lineId ? { ...item, quantity: action.quantity } : item) } };
    }
    case "cart/remove": {
      const items = state.cart.items.filter((item) => item.lineId !== action.lineId);
      return { ...state, cart: { ...state.cart, items, state: items.length === 0 ? "EMPTY" : "EDITING" } };
    }
    case "cart/setCoupon": return { ...state, cart: { ...state.cart, coupon: action.coupon } };
    case "cart/clear": return { ...state, cart: { state: "EMPTY", items: [], coupon: "" } };
    case "room/create": return {
      ...state,
      branchId: action.payload.branchId,
      mode: action.payload.mode,
      room: {
        code: action.payload.code,
        title: "午餐一起點",
        hostName: action.payload.hostName || "匿名房主",
        branchId: action.payload.branchId,
        mode: action.payload.mode,
        state: "OPEN",
        deadlineAt: action.payload.deadlineAt,
        participants: [], total: 0,
        announcement: "大家想吃的都點起來！截止前記得送出餐點。",
      },
    };
    case "room/submitParticipant": {
      if (!state.room || state.room.state !== "OPEN") return state;
      const exists = state.room.participants.some((participant) => participant.id === action.participant.id);
      const participants = exists
        ? state.room.participants.map((participant) => participant.id === action.participant.id ? action.participant : participant)
        : [...state.room.participants, action.participant];
      return { ...state, room: { ...state.room, participants, total: recalculateRoomTotal(participants) } };
    }
    case "room/lock": {
      if (!state.room || state.room.state !== "OPEN") return state;
      return { ...state, room: { ...state.room, state: transitionRoom(state.room.state, "LOCK") } };
    }
    case "room/prepareCheckout": return prepareRoomForCheckout(state);
    case "room/extend": {
      if (!state.room || state.room.state === "PAYMENT_PENDING" || state.room.state === "ORDER_CREATED") return state;
      let roomState: RoomState = state.room.state;
      if (["LOCKED", "REVIEWING", "CHECKOUT_PENDING"].includes(roomState)) roomState = transitionRoom(roomState, "REOPEN");
      return { ...state, room: { ...state.room, deadlineAt: state.room.deadlineAt + action.milliseconds, state: roomState } };
    }
    case "checkout/start": {
      if (state.checkout.state === "PAYMENT_PENDING") return state;
      const hasRoomLines = Boolean(state.room?.participants.some((participant) => participant.status === "submitted" && participant.items.length > 0));
      const hasCartLines = state.cart.items.length > 0;
      if (!hasRoomLines && !hasCartLines) return { ...state, checkout: { state: "FAILED", attemptId: null, error: "沒有可付款的餐點" } };
      let room = state.room;
      if (room?.state === "CHECKOUT_PENDING") room = { ...room, state: transitionRoom(room.state, "CREATE_PAYMENT") };
      return {
        ...state,
        room,
        cart: hasCartLines ? { ...state.cart, state: "CHECKOUT_SUBMITTING" } : state.cart,
        checkout: { state: "PAYMENT_PENDING", attemptId: action.attemptId, error: null },
      };
    }
    case "checkout/fail": {
      const room = state.room?.state === "PAYMENT_PENDING" ? { ...state.room, state: "CHECKOUT_PENDING" as const } : state.room;
      return { ...state, room, cart: { ...state.cart, state: state.cart.items.length > 0 ? "EDITING" : "EMPTY" }, checkout: { state: "FAILED", attemptId: null, error: action.error } };
    }
    case "order/complete": {
      const exists = state.orders.some((order) => order.id === action.order.id);
      return {
        ...state,
        cart: { state: "EMPTY", items: [], coupon: "" }, room: null,
        checkout: { state: "IDLE", attemptId: null, error: null },
        orders: exists ? state.orders : [action.order, ...state.orders],
        lastOrderId: action.order.id,
      };
    }
    case "order/transition": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order) return state;
      const status = transitionOrder(order.status, action.event);
      return { ...state, orders: state.orders.map((item) => item.id === action.orderId ? { ...item, status } : item) };
    }
    default: return state;
  }
}
