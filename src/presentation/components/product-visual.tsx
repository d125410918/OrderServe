import type { IllustrationKind } from "@/application/order-store/types";
import { ProductArt } from "./product-art";

export function ProductVisual({ image, kind, size = "card", alt }: { image: string; kind: IllustrationKind; size?: "card" | "hero" | "thumb"; alt: string }) {
  if (!image) return <ProductArt kind={kind} size={size} />;
  return <img className={`product-uploaded-image product-uploaded-image--${size}`} src={image} alt={alt} />;
}
