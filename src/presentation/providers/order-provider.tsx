"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import type { OrderMode } from "@/domain/catalog/types";
import type { OrderEvent } from "@/domain/order/order-machine";
import { initialOrderState, orderReducer } from "@/application/order-store/reducer";
import { LEGACY_ORDER_STORAGE_KEY, normalizePersistedOrderState, ORDER_STORAGE_KEY, serializeOrderState } from "@/application/order-store/persistence";
import type { CartLine, CompletedOrder, OrderAppState, RoomParticipant } from "@/application/order-store/types";

type OrderContextValue = {
  state: OrderAppState;
  hydrated: boolean;
  setBranch: (branchId: string) => void;
  setMode: (mode: OrderMode) => void;
  addToCart: (item: CartLine) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeFromCart: (lineId: string) => void;
  setCoupon: (coupon: string) => void;
  clearCart: () => void;
  createRoom: (payload: { code: string; hostName: string; deadlineAt: number; branchId: string; mode: OrderMode }) => void;
  submitParticipant: (participant: RoomParticipant) => void;
  lockRoom: () => void;
  prepareRoomCheckout: () => void;
  extendRoom: (milliseconds: number) => void;
  startCheckout: (attemptId: string) => void;
  failCheckout: (error: string) => void;
  completeOrder: (order: CompletedOrder) => void;
  transitionOrderStatus: (orderId: string, event: OrderEvent) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(ORDER_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_ORDER_STORAGE_KEY);
    if (saved) {
      try { dispatch({ type: "hydrate", state: normalizePersistedOrderState(JSON.parse(saved)) }); }
      catch { dispatch({ type: "hydrate", state: initialOrderState }); }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(ORDER_STORAGE_KEY, serializeOrderState(state));
    window.localStorage.removeItem(LEGACY_ORDER_STORAGE_KEY);
  }, [state, hydrated]);

  const setBranch = useCallback((branchId: string) => dispatch({ type: "branch/set", branchId }), []);
  const setMode = useCallback((mode: OrderMode) => dispatch({ type: "mode/set", mode }), []);
  const addToCart = useCallback((item: CartLine) => dispatch({ type: "cart/add", item }), []);
  const setQuantity = useCallback((lineId: string, quantity: number) => dispatch({ type: "cart/setQuantity", lineId, quantity }), []);
  const removeFromCart = useCallback((lineId: string) => dispatch({ type: "cart/remove", lineId }), []);
  const setCoupon = useCallback((coupon: string) => dispatch({ type: "cart/setCoupon", coupon }), []);
  const clearCart = useCallback(() => dispatch({ type: "cart/clear" }), []);
  const createRoom = useCallback((payload: { code: string; hostName: string; deadlineAt: number; branchId: string; mode: OrderMode }) => dispatch({ type: "room/create", payload }), []);
  const submitParticipant = useCallback((participant: RoomParticipant) => dispatch({ type: "room/submitParticipant", participant }), []);
  const lockRoom = useCallback(() => dispatch({ type: "room/lock" }), []);
  const prepareRoomCheckout = useCallback(() => dispatch({ type: "room/prepareCheckout" }), []);
  const extendRoom = useCallback((milliseconds: number) => dispatch({ type: "room/extend", milliseconds }), []);
  const startCheckout = useCallback((attemptId: string) => dispatch({ type: "checkout/start", attemptId }), []);
  const failCheckout = useCallback((error: string) => dispatch({ type: "checkout/fail", error }), []);
  const completeOrder = useCallback((order: CompletedOrder) => dispatch({ type: "order/complete", order }), []);
  const transitionOrderStatus = useCallback((orderId: string, event: OrderEvent) => dispatch({ type: "order/transition", orderId, event }), []);

  const value = useMemo<OrderContextValue>(() => ({ state, hydrated, setBranch, setMode, addToCart, setQuantity, removeFromCart, setCoupon, clearCart, createRoom, submitParticipant, lockRoom, prepareRoomCheckout, extendRoom, startCheckout, failCheckout, completeOrder, transitionOrderStatus }), [state, hydrated, setBranch, setMode, addToCart, setQuantity, removeFromCart, setCoupon, clearCart, createRoom, submitParticipant, lockRoom, prepareRoomCheckout, extendRoom, startCheckout, failCheckout, completeOrder, transitionOrderStatus]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder 必須在 OrderProvider 內使用");
  return context;
}
