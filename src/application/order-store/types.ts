import type { CartState } from "@/domain/cart/cart-machine";
import type { OrderMode } from "@/domain/catalog/types";
import type { RoomState } from "@/domain/group-order/room-machine";

export type IllustrationKind = "chicken" | "spicy" | "nuggets" | "meal" | "fries" | "drink" | "rice" | "dessert";

export type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  image: string;
  illustration: IllustrationKind;
  unitPrice: number;
  quantity: number;
  selections: string[];
  note: string;
};

export type RoomParticipant = {
  id: string;
  name: string;
  avatar?: string;
  status: "editing" | "submitted" | "revision";
  items: CartLine[];
  subtotal: number;
};

export type GroupRoom = {
  code: string;
  title: string;
  hostName: string;
  branchId: string;
  mode: OrderMode;
  state: RoomState;
  deadlineAt: number;
  participants: RoomParticipant[];
  total: number;
  announcement: string;
};

export type CompletedOrder = {
  id: string;
  number: string;
  amount: number;
  branchName: string;
  mode: OrderMode;
  paymentMethod: "LINE Pay";
  createdAt: number;
};

export type OrderAppState = {
  branchId: string;
  mode: OrderMode;
  cart: {
    state: CartState;
    items: CartLine[];
    coupon: string;
  };
  room: GroupRoom | null;
  lastOrder: CompletedOrder | null;
};

export type OrderAction =
  | { type: "hydrate"; state: OrderAppState }
  | { type: "branch/set"; branchId: string }
  | { type: "mode/set"; mode: OrderMode }
  | { type: "cart/add"; item: CartLine }
  | { type: "cart/setQuantity"; lineId: string; quantity: number }
  | { type: "cart/remove"; lineId: string }
  | { type: "cart/setCoupon"; coupon: string }
  | { type: "cart/clear" }
  | { type: "room/create"; payload: { code: string; hostName: string; deadlineAt: number; branchId: string; mode: OrderMode } }
  | { type: "room/submitParticipant"; participant: RoomParticipant }
  | { type: "room/setState"; state: RoomState }
  | { type: "room/extend"; milliseconds: number }
  | { type: "order/complete"; order: CompletedOrder };
