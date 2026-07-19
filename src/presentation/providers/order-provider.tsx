"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import { initialOrderState, orderReducer } from "@/application/order-store/reducer";
import type { CartLine, CompletedOrder, OrderAppState, RoomParticipant } from "@/application/order-store/types";
import type { OrderMode } from "@/domain/catalog/types";
import type { RoomState } from "@/domain/group-order/room-machine";

const STORAGE_KEY = "dongji-order-state-v1";

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
  setRoomState: (state: RoomState) => void;
  extendRoom: (milliseconds: number) => void;
  completeOrder: (order: CompletedOrder) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderReducer, initialOrderState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) dispatch({ type: "hydrate", state: JSON.parse(saved) as OrderAppState });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
  const setRoomState = useCallback((roomState: RoomState) => dispatch({ type: "room/setState", state: roomState }), []);
  const extendRoom = useCallback((milliseconds: number) => dispatch({ type: "room/extend", milliseconds }), []);
  const completeOrder = useCallback((order: CompletedOrder) => dispatch({ type: "order/complete", order }), []);

  const value = useMemo(() => ({ state, hydrated, setBranch, setMode, addToCart, setQuantity, removeFromCart, setCoupon, clearCart, createRoom, submitParticipant, setRoomState, extendRoom, completeOrder }), [state, hydrated, setBranch, setMode, addToCart, setQuantity, removeFromCart, setCoupon, clearCart, createRoom, submitParticipant, setRoomState, extendRoom, completeOrder]);

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder(): OrderContextValue {
  const value = useContext(OrderContext);
  if (!value) throw new Error("useOrder 必須在 OrderProvider 內使用");
  return value;
}
