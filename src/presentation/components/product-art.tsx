import type { IllustrationKind } from "@/application/order-store/types";

const symbols: Record<IllustrationKind, string[]> = {
  chicken: ["🍗", "🍗", "🍗"],
  spicy: ["🍗", "🌶️", "🍗"],
  nuggets: ["🟠", "🟠", "🟠"],
  meal: ["🍗", "🍟", "🥤"],
  fries: ["🍟", "🍟", "✨"],
  drink: ["🥤", "🧊", "🍋"],
  rice: ["🍚", "🍗", "🥬"],
  dessert: ["🥧", "✨", "☕"],
};

export function ProductArt({ kind, size = "card" }: { kind: IllustrationKind; size?: "card" | "hero" | "thumb" }) {
  return (
    <div className={`product-art product-art--${kind} product-art--${size}`} aria-hidden="true">
      <div className="product-art__glow" />
      <div className="product-art__plate" />
      <div className="product-art__symbols">
        {symbols[kind].map((symbol, index) => <span key={`${symbol}-${index}`}>{symbol}</span>)}
      </div>
      <div className="product-art__steam"><i /><i /><i /></div>
    </div>
  );
}
