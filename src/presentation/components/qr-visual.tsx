export function QrVisual({ seed = "482761", label = "分店點餐 QR Code" }: { seed?: string; label?: string }) {
  const bits = Array.from({ length: 81 }, (_, index) => ((seed.charCodeAt(index % seed.length) + index * 7) % 3 !== 0));
  return (
    <div className="qr-visual" role="img" aria-label={label}>
      {bits.map((active, index) => <span key={index} className={active ? "is-active" : ""} />)}
    </div>
  );
}
