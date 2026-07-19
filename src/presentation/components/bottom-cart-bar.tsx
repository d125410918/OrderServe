"use client";

import Link from "next/link";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { useOrder } from "@/presentation/providers/order-provider";

export function BottomCartBar() {
  const { state } = useOrder();
  const quantity = state.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const total = state.cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  if (quantity === 0) return null;
  return (
    <div className="bottom-cart-bar" role="region" aria-label="購物車摘要">
      <Link href="/cart" className="bottom-cart-bar__icon"><ShoppingCart size={24} /><span>{quantity}</span></Link>
      <div className="bottom-cart-bar__copy"><strong>購物車 {quantity} 項</strong><span>NT$ {total.toLocaleString("zh-TW")}</span></div>
      <Link href="/cart" className="button button--gold">查看購物車 <ChevronRight size={19} /></Link>
    </div>
  );
}
