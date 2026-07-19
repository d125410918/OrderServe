"use client";

import { Bike, ShoppingBag, Utensils } from "lucide-react";
import type { OrderMode } from "@/domain/catalog/types";

const modes: Array<{ value: OrderMode; label: string; icon: typeof Bike }> = [
  { value: "delivery", label: "外送", icon: Bike },
  { value: "pickup", label: "自取", icon: ShoppingBag },
  { value: "dine-in", label: "店內", icon: Utensils },
];

export function ModeSwitcher({ value, onChange, compact = false }: { value: OrderMode; onChange: (mode: OrderMode) => void; compact?: boolean }) {
  return (
    <div className={`mode-switcher ${compact ? "mode-switcher--compact" : ""}`} aria-label="取餐方式">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <button key={mode.value} type="button" className={value === mode.value ? "is-active" : ""} onClick={() => onChange(mode.value)} aria-pressed={value === mode.value}>
            <Icon size={18} /><span>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
