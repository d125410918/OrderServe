import { Drumstick } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-mark ${compact ? "brand-mark--compact" : ""}`} aria-label="咚雞點餐">
      <span className="brand-mark__mascot" aria-hidden="true"><Drumstick size={compact ? 18 : 25} /></span>
      <span className="brand-mark__copy">
        <strong>咚雞點餐</strong>
        {!compact && <small>咚一下，美味送到家！</small>}
      </span>
    </span>
  );
}
