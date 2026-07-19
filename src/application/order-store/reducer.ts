import type { OrderAction, OrderAppState, RoomParticipant } from "./types";

export const initialOrderState: OrderAppState = {
  branchId: "xinyi",
  mode: "delivery",
  cart: { state: "EMPTY", items: [], coupon: "" },
  room: null,
  lastOrder: null,
};

function recalculateRoomTotal(participants: RoomParticipant[]): number {
  return participants.reduce((sum, participant) => sum + participant.subtotal, 0);
}

export function orderReducer(state: OrderAppState, action: OrderAction): OrderAppState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "branch/set":
      return { ...state, branchId: action.branchId };
    case "mode/set":
      return { ...state, mode: action.mode };
    case "cart/add": {
      const existing = state.cart.items.find((item) => item.lineId === action.item.lineId);
      const items = existing
        ? state.cart.items.map((item) => item.lineId === action.item.lineId ? { ...item, quantity: item.quantity + action.item.quantity } : item)
        : [...state.cart.items, action.item];
      return { ...state, cart: { ...state.cart, items, state: "EDITING" } };
    }
    case "cart/setQuantity": {
      if (action.quantity <= 0) {
        return orderReducer(state, { type: "cart/remove", lineId: action.lineId });
      }
      return {
        ...state,
        cart: {
          ...state.cart,
          state: "EDITING",
          items: state.cart.items.map((item) => item.lineId === action.lineId ? { ...item, quantity: action.quantity } : item),
        },
      };
    }
    case "cart/remove": {
      const items = state.cart.items.filter((item) => item.lineId !== action.lineId);
      return { ...state, cart: { ...state.cart, items, state: items.length === 0 ? "EMPTY" : "EDITING" } };
    }
    case "cart/setCoupon":
      return { ...state, cart: { ...state.cart, coupon: action.coupon } };
    case "cart/clear":
      return { ...state, cart: { state: "EMPTY", items: [], coupon: "" } };
    case "room/create":
      return {
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
          participants: [],
          total: 0,
          announcement: "大家想吃的都點起來！截止前記得送出餐點。",
        },
      };
    case "room/submitParticipant": {
      if (!state.room) return state;
      const exists = state.room.participants.some((participant) => participant.id === action.participant.id);
      const participants = exists
        ? state.room.participants.map((participant) => participant.id === action.participant.id ? action.participant : participant)
        : [...state.room.participants, action.participant];
      return { ...state, room: { ...state.room, participants, total: recalculateRoomTotal(participants) } };
    }
    case "room/setState":
      return state.room ? { ...state, room: { ...state.room, state: action.state } } : state;
    case "room/extend":
      return state.room ? { ...state, room: { ...state.room, deadlineAt: state.room.deadlineAt + action.milliseconds, state: "OPEN" } } : state;
    case "order/complete":
      return { ...state, lastOrder: action.order, cart: { state: "CONVERTED", items: state.cart.items, coupon: state.cart.coupon } };
    default:
      return state;
  }
}
