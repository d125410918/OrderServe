"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Download, MapPin, Pause, Play, Plus, Rocket, X } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";
import { getBranchPublishErrors } from "@/domain/catalog/branch-machine";
import { QrVisual } from "@/presentation/components/qr-visual";
import { useCatalog } from "@/presentation/providers/catalog-provider";

const statusLabel = { SETUP: "設定中", ACTIVE: "營業中", PAUSED: "暫停營業", ARCHIVED: "已封存" } as const;

export default function AdminBranchesPage() {
  const router = useRouter();
  const { state, storageError, createBranch, selectAdminBranch, publishBranch, pauseBranch, resumeBranch, getCategories, getProducts } = useCatalog();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", address: "", phone: "", eta: "25–35 分鐘", deliveryFee: "49", packagingFee: "10" });

  function manage(branchId: string) { selectAdminBranch(branchId); router.push("/admin/menu"); }
  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) { setError("請完整填寫分店名稱、地址與電話"); return; }
    const id = `branch-${Date.now().toString(36)}`;
    createBranch({ id, brandId: "dongji", name: form.name.trim(), address: form.address.trim(), phone: form.phone.trim(), eta: form.eta.trim() || "25–35 分鐘", isOpen: false, deliveryFee: Math.max(0, Number(form.deliveryFee) || 0), packagingFee: Math.max(0, Number(form.packagingFee) || 0), lifecycle: "SETUP", createdAt: Date.now() });
    setCreating(false);
    router.push("/admin/menu");
  }
  function publish(branchId: string) {
    setError("");
    try { publishBranch(branchId); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "無法發布分店"); }
  }

  return <AdminShell title="分店與 QR Code" actions={<button className="button button--primary" type="button" onClick={() => setCreating(true)}><Plus size={18} />新增分店</button>}>
    {(error || storageError) && <div className="admin-alert" role="alert">{error || storageError}</div>}
    <section className="branch-card-grid">{state.branches.filter((branch) => branch.lifecycle !== "ARCHIVED").map((branch) => {
      const categories = getCategories(branch.id);
      const products = getProducts(branch.id);
      const publishErrors = getBranchPublishErrors(branch, categories, products);
      return <article className="branch-card" key={branch.id}><div className="branch-card__top"><div><span className={`status-pill branch-status--${branch.lifecycle.toLowerCase()}`}>{statusLabel[branch.lifecycle]}</span><h3 style={{ marginTop: 10 }}>{branch.name}</h3><p><MapPin size={16} style={{ verticalAlign: "middle" }} /> {branch.address}</p><p>{branch.phone}・預估 {branch.eta}</p></div>{branch.lifecycle === "ACTIVE" ? <QrVisual seed={branch.id} label={`${branch.name}點餐 QR Code`} /> : <div className="branch-setup-badge"><Building2 size={32} /><span>尚未發布</span></div>}</div><div className="summary-list" style={{ marginTop: 18 }}><div className="summary-row"><span>菜單分區</span><strong>{categories.length} 個</strong></div><div className="summary-row"><span>菜品數量</span><strong>{products.length} 項</strong></div><div className="summary-row"><span>已上傳圖片</span><strong>{products.filter((product) => product.image).length} 張</strong></div></div>{branch.lifecycle === "SETUP" && publishErrors.length > 0 && <div className="setup-hint">尚需完成：{publishErrors.join("、")}</div>}<div className="branch-actions"><button className="button button--soft" type="button" onClick={() => manage(branch.id)}><Building2 size={17} />管理分店</button>{branch.lifecycle === "SETUP" && <button className="button button--primary" type="button" onClick={() => publish(branch.id)} disabled={publishErrors.length > 0}><Rocket size={17} />發布</button>}{branch.lifecycle === "ACTIVE" && <><button className="button button--outline" type="button"><Download size={17} />下載 QR</button><button className="button button--outline" type="button" onClick={() => pauseBranch(branch.id)}><Pause size={17} />暫停</button></>}{branch.lifecycle === "PAUSED" && <button className="button button--primary" type="button" onClick={() => resumeBranch(branch.id)}><Play size={17} />恢復營業</button>}</div></article>;
    })}</section>
    {creating && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="new-branch-title"><div className="admin-modal__header"><div><h2 id="new-branch-title">新增乾淨分店</h2><p className="muted">建立後不會複製任何既有菜單，店長可自行新增分區、菜品與圖片。</p></div><button className="icon-button" type="button" onClick={() => setCreating(false)} aria-label="關閉"><X /></button></div><form className="admin-form" onSubmit={submit}><label>分店名稱<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="例如：高雄巨蛋店" /></label><label>完整地址<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="縣市、區域、路名與門牌" /></label><label>聯絡電話<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="07-123-4567" /></label><div className="admin-form__two"><label>預估時間<input value={form.eta} onChange={(event) => setForm({ ...form, eta: event.target.value })} /></label><label>外送費<input type="number" min="0" value={form.deliveryFee} onChange={(event) => setForm({ ...form, deliveryFee: event.target.value })} /></label></div><label>包裝費<input type="number" min="0" value={form.packagingFee} onChange={(event) => setForm({ ...form, packagingFee: event.target.value })} /></label>{error && <div className="form-error">{error}</div>}<div className="admin-modal__actions"><button className="button button--outline" type="button" onClick={() => setCreating(false)}>取消</button><button className="button button--primary" type="submit">建立並進入菜單設定</button></div></form></section></div>}
  </AdminShell>;
}
