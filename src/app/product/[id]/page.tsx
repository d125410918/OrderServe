"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";
import { getProduct } from "@/infrastructure/mock/catalog";
import { PageHeader } from "@/presentation/components/page-header";
import { ProductArt } from "@/presentation/components/product-art";
import { calculateConfiguredPrice, validateSelections, type SelectionMap } from "@/features/product/configure-product";
import { useOrder } from "@/presentation/providers/order-provider";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { addToCart } = useOrder();
  const product = getProduct(params.id);
  const [selections, setSelections] = useState<SelectionMap>(() => Object.fromEntries((product?.modifiers ?? []).filter((group) => group.required && group.options[0]).map((group) => [group.id, [group.options[0].id]])));
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const unitPrice = useMemo(() => product ? calculateConfiguredPrice(product.price, product.modifiers, selections) : 0, [product, selections]);

  if (!product) return <main className="page-gradient"><PageHeader title="找不到商品" /><div className="page-card"><div className="page-card__body"><p>此商品不存在或已下架。</p></div></div></main>;

  function toggleSelection(groupId: string, optionId: string, max: number) {
    setSelections((current) => {
      const selected = current[groupId] ?? [];
      if (max === 1) return { ...current, [groupId]: [optionId] };
      return { ...current, [groupId]: selected.includes(optionId) ? selected.filter((id) => id !== optionId) : [...selected, optionId].slice(0, max) };
    });
  }

  function submit() {
    if (!product) return;
    const validationErrors = validateSelections(product.modifiers, selections);
    setErrors(validationErrors);
    if (validationErrors.length > 0) return;
    const selectionLabels = product.modifiers.flatMap((group) => group.options.filter((option) => selections[group.id]?.includes(option.id)).map((option) => `${group.name}：${option.name}`));
    const signature = Object.entries(selections).map(([key, value]) => `${key}:${[...value].sort().join(",")}`).sort().join("|");
    addToCart({ lineId: `${product.id}-${signature}-${note.trim()}`, productId: product.id, name: product.name, image: product.image, illustration: product.illustration, unitPrice, quantity, selections: selectionLabels, note: note.trim() });
    router.push("/menu");
  }

  return (
    <main className="page-gradient">
      <PageHeader title={product.name} subtitle="選擇份量、辣度與加購內容" actions={<button className="icon-button icon-button--ghost" type="button" aria-label="加入收藏"><Heart /></button>} />
      <section className="product-detail">
        <div className="product-detail__visual"><ProductArt kind={product.illustration} size="hero" /></div>
        <div className="product-detail__content">
          <div className="product-detail__title"><div><h1>{product.name}</h1><p>{product.description}</p></div>{product.originalPrice && <span className="hero-badge">優惠<br />省 NT${product.originalPrice - product.price}</span>}</div>
          <div className="price product-detail__price">NT$ {unitPrice}</div>
          {product.modifiers.map((group) => (
            <fieldset className="option-group" key={group.id}>
              <legend className="sr-only">{group.name}</legend>
              <div className="option-group__title"><strong>{group.name}</strong>{group.required ? <span className="required-label">必選</span> : <span className="optional-label">可複選</span>}</div>
              <div className="option-list">
                {group.options.map((option) => {
                  const checked = selections[group.id]?.includes(option.id) ?? false;
                  return <label className="option-item" key={option.id}><input type={group.max === 1 ? "radio" : "checkbox"} name={group.id} checked={checked} onChange={() => toggleSelection(group.id, option.id, group.max)} /><span>{option.name}</span><span>{option.priceDelta > 0 ? `+NT$ ${option.priceDelta}` : "NT$ 0"}</span></label>;
                })}
              </div>
            </fieldset>
          ))}
          <div className="option-group note-field"><div className="option-group__title"><strong>備註</strong><span className="optional-label">選填，最多 50 字</span></div><textarea maxLength={50} value={note} onChange={(event) => setNote(event.target.value)} placeholder="例如：醬料分開、餐具一份" /><div className="muted" style={{ textAlign: "right" }}>{note.length}/50</div></div>
          <div className="quantity-row"><strong>數量</strong><div className="stepper"><button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="減少數量"><Minus size={18} /></button><strong>{quantity}</strong><button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="增加數量"><Plus size={18} /></button></div></div>
          {errors.length > 0 && <div className="form-error" role="alert">{errors.join("、")}</div>}
          <div className="product-detail__sticky"><strong>小計 NT$ {(unitPrice * quantity).toLocaleString("zh-TW")}</strong><button type="button" className="button button--gold" onClick={submit}>加入購物車</button></div>
        </div>
      </section>
    </main>
  );
}
