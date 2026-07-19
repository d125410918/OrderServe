import { Building2, Download, MapPin, Plus } from "lucide-react";
import { AdminShell } from "@/features/admin/admin-shell";
import { branches } from "@/infrastructure/mock/catalog";
import { QrVisual } from "@/presentation/components/qr-visual";

export default function AdminBranchesPage() {
  return <AdminShell title="分店與 QR Code" actions={<button className="button button--primary" type="button"><Plus size={18} />新增分店</button>}><section className="branch-card-grid">{branches.map((branch) => <article className="branch-card" key={branch.id}><div className="branch-card__top"><div><span className="status-pill">營業中</span><h3 style={{ marginTop: 10 }}>{branch.name}</h3><p><MapPin size={16} style={{ verticalAlign: "middle" }} /> {branch.address}</p><p>{branch.phone}・預估 {branch.eta}</p></div><QrVisual seed={branch.id} label={`${branch.name}點餐 QR Code`} /></div><div className="summary-list" style={{ marginTop: 18 }}><div className="summary-row"><span>品牌菜單版本</span><strong>v12.4</strong></div><div className="summary-row"><span>分店覆寫項目</span><strong>{branch.id === "xinyi" ? 6 : 2} 項</strong></div><div className="summary-row"><span>今日訂單</span><strong>{branch.id === "xinyi" ? 126 : 74} 筆</strong></div></div><div style={{ display: "flex", gap: 8, marginTop: 18 }}><button className="button button--soft" type="button"><Building2 size={17} />管理分店</button><button className="button button--outline" type="button"><Download size={17} />下載 QR</button></div></article>)}</section></AdminShell>;
}
